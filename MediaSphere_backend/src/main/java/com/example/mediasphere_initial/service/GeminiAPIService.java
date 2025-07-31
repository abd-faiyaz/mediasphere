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
import reactor.core.publisher.Mono;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class GeminiAPIService {
    
    @Autowired
    private AIRequestRepository aiRequestRepository;
    
    @Autowired
    private AIGeneratedContentRepository aiGeneratedContentRepository;
    
    @Autowired
    private ContentFilterService contentFilterService;
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    @Value("${ai.service.timeout-seconds:30}")
    private int timeoutSeconds;
    
    @Value("${ai.service.retry-attempts:3}")
    private int retryAttempts;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public GeminiAPIService() {
        this.webClient = WebClient.builder().build();
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
                
                // Create request body for Gemini API
                Map<String, Object> requestBody = createGeminiRequestBody(prompt);
                
                // Call Gemini API
                Mono<String> responseMono = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(timeoutSeconds));
                
                String responseJson = responseMono.block();
                
                if (responseJson != null && !responseJson.trim().isEmpty()) {
                    String extractedText = extractTextFromGeminiResponse(responseJson);
                    if (extractedText != null && !extractedText.trim().isEmpty()) {
                        return extractedText;
                    }
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
    
    private Map<String, Object> createGeminiRequestBody(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // Create contents array
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        requestBody.put("contents", List.of(content));
        
        // Add generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1000);
        requestBody.put("generationConfig", generationConfig);
        
        return requestBody;
    }
    
    private String extractTextFromGeminiResponse(String responseJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseJson);
            JsonNode candidatesNode = rootNode.path("candidates");
            
            if (candidatesNode.isArray() && candidatesNode.size() > 0) {
                JsonNode firstCandidate = candidatesNode.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode partsNode = contentNode.path("parts");
                
                if (partsNode.isArray() && partsNode.size() > 0) {
                    JsonNode firstPart = partsNode.get(0);
                    JsonNode textNode = firstPart.path("text");
                    
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }
            
            log.warn("Could not extract text from Gemini response: {}", responseJson);
            return null;
            
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            return null;
        }
    }
    
    private String getFallbackResponse(String prompt, AIRequest.RequestType requestType) {
        // Generic fallback messages
        switch (requestType) {
            case SUMMARY:
                return "AI summarization service is temporarily unavailable. Please try again later.";
            case QUIZ:
                return "AI quiz generation service is temporarily unavailable. Please try again later.";
            case ANALYSIS:
                return "AI analysis service is temporarily unavailable. Please try again later.";
            case RECOMMENDATION:
                return "AI recommendation service is temporarily unavailable. Please try again later.";
            default:
                return "AI service is temporarily unavailable. Please try again later.";
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
