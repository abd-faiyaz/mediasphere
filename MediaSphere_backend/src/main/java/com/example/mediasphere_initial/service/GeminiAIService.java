package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.AIRequest;
import com.example.mediasphere_initial.model.AIGeneratedContent;
import com.example.mediasphere_initial.repository.AIRequestRepository;
import com.example.mediasphere_initial.repository.AIGeneratedContentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class GeminiAIService {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Autowired
    private AIRequestRepository aiRequestRepository;
    
    @Autowired
    private AIGeneratedContentRepository aiGeneratedContentRepository;
    
    @Autowired
    private ContentFilterService contentFilterService;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    @Value("${ai.service.timeout-seconds:30}")
    private int timeoutSeconds;
    
    @Value("${ai.service.retry-attempts:3}")
    private int retryAttempts;
    
    public GeminiAIService() {
        this.webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com")
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public String callGeminiWithFallback(String prompt, UUID userId, AIRequest.RequestType requestType) {
        long startTime = System.currentTimeMillis();
        
        // Create AI request record
        AIRequest aiRequest = createAIRequest(userId, requestType, prompt);
        
        try {
            // Check cache first
            String contentHash = contentFilterService.generateContentHash(prompt);
            Optional<AIGeneratedContent> cached = findCachedContent(contentHash, requestType);
            
            if (cached.isPresent()) {
                log.info("Using cached response for request: {}", aiRequest.getId());
                updateAIRequestSuccess(aiRequest, cached.get().getContentData(), true, 0);
                return cached.get().getContentData();
            }
            
            // Call Gemini API with retries
            String response = callGeminiWithRetry(prompt);
            
            // Filter and process response
            String filteredResponse = contentFilterService.filterResponse(response);
            
            // Cache the response
            cacheResponse(contentHash, filteredResponse, requestType);
            
            // Update request record
            int processingTime = (int) (System.currentTimeMillis() - startTime);
            updateAIRequestSuccess(aiRequest, filteredResponse, false, processingTime);
            
            return filteredResponse;
            
        } catch (Exception e) {
            log.error("AI request failed for user: {}, type: {}", userId, requestType, e);
            
            // Try fallback mechanisms
            String fallbackResponse = getFallbackResponse(prompt, requestType);
            updateAIRequestFailure(aiRequest, e.getMessage());
            
            return fallbackResponse;
        }
    }
    
    private String callGeminiWithRetry(String prompt) throws Exception {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                log.debug("Attempting Gemini API call, attempt: {}", attempt);
                
                String response = callGeminiAPI(prompt);
                
                if (response != null && !response.trim().isEmpty()) {
                    return response;
                }
                
                throw new RuntimeException("Empty response from Gemini API");
                
            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini API call failed, attempt: {}/{}", attempt, retryAttempts, e);
                
                if (attempt < retryAttempts) {
                    try {
                        Thread.sleep(1000 * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted during retry", ie);
                    }
                }
            }
        }
        
        throw new RuntimeException("All Gemini API attempts failed", lastException);
    }
    
    private String callGeminiAPI(String prompt) throws Exception {
        String requestBody = createGeminiRequestBody(prompt);
        
        try {
            String response = webClient.post()
                .uri("/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}", geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();
            
            return parseGeminiResponse(response);
            
        } catch (Exception e) {
            log.error("Failed to call Gemini API", e);
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }
    
    private String createGeminiRequestBody(String prompt) throws Exception {
        Map<String, Object> request = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "topK", 40,
                "topP", 0.95,
                "maxOutputTokens", 1024
            )
        );
        
        return objectMapper.writeValueAsString(request);
    }
    
    private String parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        
        if (root.has("error")) {
            String errorMessage = root.get("error").get("message").asText();
            throw new RuntimeException("Gemini API error: " + errorMessage);
        }
        
        JsonNode candidates = root.get("candidates");
        if (candidates != null && candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.get("content");
            if (content != null) {
                JsonNode parts = content.get("parts");
                if (parts != null && parts.isArray() && parts.size() > 0) {
                    return parts.get(0).get("text").asText();
                }
            }
        }
        
        throw new RuntimeException("Invalid response format from Gemini API");
    }
    
    private String getFallbackResponse(String prompt, AIRequest.RequestType requestType) {
        // Try to get a recent similar response
        String recentResponse = getRecentSimilarResponse(prompt, requestType);
        if (recentResponse != null) {
            return recentResponse + " (Based on recent similar analysis)";
        }
        
        // Generic fallback messages
        switch (requestType) {
            case SUMMARY:
                return "Sorry, AI summarization service is temporarily unavailable. Please try again later.";
            case QUIZ:
                return "Sorry, AI quiz generation service is temporarily unavailable. Please try again later.";
            case ANALYSIS:
                return "Sorry, AI analysis service is temporarily unavailable. Please try again later.";
            case RECOMMENDATION:
                return "Sorry, AI recommendation service is temporarily unavailable. Please try again later.";
            default:
                return "Sorry, AI service is temporarily unavailable. Please try again later.";
        }
    }
    
    private String getRecentSimilarResponse(String prompt, AIRequest.RequestType requestType) {
        try {
            // This is a simplified similarity check - in production, you might want semantic similarity
            // Could implement search for similar prompts from the last 24 hours
            return null; // Implement if needed
        } catch (Exception e) {
            log.warn("Failed to get recent similar response", e);
            return null;
        }
    }
    
    private AIRequest createAIRequest(UUID userId, AIRequest.RequestType requestType, String prompt) {
        AIRequest request = new AIRequest();
        request.setUserId(userId);
        request.setRequestType(requestType);
        request.setRequestData(prompt);
        request.setStatus(AIRequest.Status.PENDING);
        return aiRequestRepository.save(request);
    }
    
    private void updateAIRequestSuccess(AIRequest request, String response, boolean fromCache, int processingTime) {
        request.setStatus(AIRequest.Status.COMPLETED);
        request.setResponseData(response);
        request.setProcessingTimeMs(processingTime);
        request.setUpdatedAt(LocalDateTime.now());
        aiRequestRepository.save(request);
    }
    
    private void updateAIRequestFailure(AIRequest request, String errorMessage) {
        request.setStatus(AIRequest.Status.FAILED);
        request.setErrorMessage(errorMessage);
        request.setUpdatedAt(LocalDateTime.now());
        aiRequestRepository.save(request);
    }
    
    private Optional<AIGeneratedContent> findCachedContent(String contentHash, AIRequest.RequestType requestType) {
        AIGeneratedContent.ContentType contentType = mapRequestTypeToContentType(requestType);
        return aiGeneratedContentRepository.findByContentHashAndContentType(contentHash, contentType);
    }
    
    private void cacheResponse(String contentHash, String response, AIRequest.RequestType requestType) {
        try {
            AIGeneratedContent content = new AIGeneratedContent();
            content.setContentType(mapRequestTypeToContentType(requestType));
            content.setContentHash(contentHash);
            content.setContentData(response);
            content.setExpiresAt(LocalDateTime.now().plusDays(7)); // Cache for 7 days
            
            aiGeneratedContentRepository.save(content);
        } catch (Exception e) {
            log.warn("Failed to cache AI response", e);
        }
    }
    
    private AIGeneratedContent.ContentType mapRequestTypeToContentType(AIRequest.RequestType requestType) {
        switch (requestType) {
            case SUMMARY: return AIGeneratedContent.ContentType.SUMMARY;
            case QUIZ: return AIGeneratedContent.ContentType.QUIZ_QUESTIONS;
            case ANALYSIS: return AIGeneratedContent.ContentType.SENTIMENT_ANALYSIS;
            case RECOMMENDATION: return AIGeneratedContent.ContentType.RECOMMENDATIONS;
            default: return AIGeneratedContent.ContentType.SUMMARY;
        }
    }
}
