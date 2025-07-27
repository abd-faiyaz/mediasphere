package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.dto.SummaryRequest;
import com.example.mediasphere_initial.dto.SummaryResponse;
import com.example.mediasphere_initial.model.AIRequest;
import com.example.mediasphere_initial.service.ContentAggregatorService.ContentAggregationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class SummaryService {
    
    @Autowired
    private ContentAggregatorService contentAggregatorService;
    
    @Autowired
    private GeminiAPIService geminiAPIService;
    
    public SummaryResponse generateSummary(SummaryRequest request, UUID userId) {
        try {
            log.info("Generating summary for user: {}, request: {}", userId, request);
            
            // Validate request
            if (request.getMediaId() == null && request.getClubId() == null && request.getThreadId() == null) {
                return new SummaryResponse(false, "At least one of mediaId, clubId, or threadId must be provided");
            }
            
            // Aggregate content based on scope
            ContentAggregationResult aggregationResult = contentAggregatorService.aggregateContentForSummary(
                parseUUID(request.getMediaId()), 
                parseUUID(request.getClubId()), 
                parseUUID(request.getThreadId())
            );
            
            if (aggregationResult.getError() != null) {
                return new SummaryResponse(false, "Content aggregation failed: " + aggregationResult.getError());
            }
            
            // Create AI prompt for summary
            String prompt = createSummaryPrompt(aggregationResult, request);
            
            // Call Gemini AI
            String aiResponse = geminiAPIService.callGeminiWithFallback(prompt, userId, AIRequest.RequestType.SUMMARY);
            
            // Process and structure the response
            SummaryResponse response = processSummaryResponse(aiResponse, aggregationResult, request);
            response.setSuccess(true);
            response.setGeneratedAt(LocalDateTime.now());
            
            log.info("Summary generated successfully for user: {}", userId);
            return response;
            
        } catch (Exception e) {
            log.error("Error generating summary for user: {}", userId, e);
            return new SummaryResponse(false, "Failed to generate summary: " + e.getMessage());
        }
    }
    
    private String createSummaryPrompt(ContentAggregationResult aggregationResult, SummaryRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        String summaryType = request.getSummaryType() != null ? request.getSummaryType() : "DETAILED";
        int maxWords = request.getMaxWords() > 0 ? request.getMaxWords() : 200;
        
        prompt.append("Please create a ").append(summaryType.toLowerCase()).append(" summary ");
        prompt.append("of the following ").append(aggregationResult.getSourceType().toLowerCase()).append(" content. ");
        prompt.append("Keep the summary to approximately ").append(maxWords).append(" words. ");
        
        if (request.isIncludeTopics()) {
            prompt.append("Also identify 3-5 key topics discussed. ");
        }
        
        prompt.append("Focus on the main points, key insights, and important discussions.\n\n");
        prompt.append("Content to summarize:\n");
        prompt.append(aggregationResult.getAggregatedContent());
        
        if (request.isIncludeTopics()) {
            prompt.append("\n\nPlease format your response as:\n");
            prompt.append("SUMMARY: [your summary here]\n");
            prompt.append("KEY_TOPICS: [topic1, topic2, topic3, etc.]");
        }
        
        return prompt.toString();
    }
    
    private SummaryResponse processSummaryResponse(String aiResponse, ContentAggregationResult aggregationResult, SummaryRequest request) {
        SummaryResponse response = new SummaryResponse();
        
        if (request.isIncludeTopics() && aiResponse.contains("KEY_TOPICS:")) {
            // Parse structured response
            String[] parts = aiResponse.split("KEY_TOPICS:");
            response.setSummary(parts[0].replace("SUMMARY:", "").trim());
            
            if (parts.length > 1) {
                String topicsString = parts[1].trim();
                List<String> topics = Arrays.asList(topicsString.split(",\\s*"));
                response.setKeyTopics(topics);
            }
        } else {
            // Use raw response as summary
            response.setSummary(aiResponse.trim());
        }
        
        // Set metadata
        response.setWordCount(countWords(response.getSummary()));
        response.setSourceType(aggregationResult.getSourceType());
        response.setSourceTitle(aggregationResult.getSourceTitle());
        response.setFromCache(false); // This would be set by the AI service if from cache
        
        return response;
    }
    
    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }
    
    private UUID parseUUID(String uuidString) {
        if (uuidString == null || uuidString.trim().isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(uuidString.trim());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", uuidString);
            return null;
        }
    }
}
