package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.AIRequest;
import com.example.mediasphere_initial.model.AIGeneratedContent;
import com.example.mediasphere_initial.repository.AIRequestRepository;
import com.example.mediasphere_initial.repository.AIGeneratedContentRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class GeminiAIService {
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private AIRequestRepository aiRequestRepository;
    
    @Autowired
    private AIGeneratedContentRepository aiGeneratedContentRepository;
    
    @Autowired
    private ContentFilterService contentFilterService;
    
    @Value("${ai.service.timeout-seconds:30}")
    private int timeoutSeconds;
    
    @Value("${ai.service.retry-attempts:3}")
    private int retryAttempts;
    
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
                
                String response = chatClient.prompt(prompt)
                    .call()
                    .content();
                
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
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            // This is a simplified similarity check - in production, you might want semantic similarity
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
