package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.service.AIService;
import com.example.mediasphere_initial.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Autowired
    private AIService aiService;

    // POST /ai/analyze – Analyze characters/themes/sentiment
    @PostMapping("/analyze")
    public ResponseEntity<AIAnalysisResponse> analyzeContent(@RequestBody AIAnalysisRequest request) {
        try {
            AIAnalysisResponse response = aiService.analyzeContent(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /ai/prompts – Get discussion prompts
    @PostMapping("/prompts")
    public ResponseEntity<AIPromptResponse> getDiscussionPrompts(@RequestBody AIPromptRequest request) {
        try {
            AIPromptResponse response = aiService.generateDiscussionPrompts(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /ai/quiz – Generate quiz
    @PostMapping("/quiz")
    public ResponseEntity<AIQuizResponse> generateQuiz(@RequestBody AIQuizRequest request) {
        try {
            AIQuizResponse response = aiService.generateQuiz(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /ai/recommendations – Personalized content recommendations
    @GetMapping("/recommendations")
    public ResponseEntity<AIRecommendationResponse> getRecommendations(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestParam(required = false) String mediaType) {
        try {
            AIRecommendationResponse response = aiService.getPersonalizedRecommendations(userId, limit, mediaType);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /ai/summarize – Get AI summary of a chapter/episode
    @PostMapping("/summarize")
    public ResponseEntity<AISummaryResponse> summarizeContent(@RequestBody AISummaryRequest request) {
        try {
            AISummaryResponse response = aiService.summarizeContent(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    
    @PostMapping("/gemini/test")
    public ResponseEntity<BaseAIResponse> testGeminiAI(@RequestBody TestAIRequest request) {
        try {
            // This will be implemented in a future phase
            BaseAIResponse aiResponse = new BaseAIResponse(true, "Gemini AI test endpoint available - Phase 2");
            aiResponse.setRequestId(UUID.randomUUID().toString());
            
            return ResponseEntity.ok(aiResponse);
            
        } catch (Exception e) {
            BaseAIResponse errorResponse = new BaseAIResponse(false, "Gemini AI test failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("AI service is running - Phase 2 implementation with fixed dependencies");
    }
    
    public static class TestAIRequest {
        private String prompt;
        
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
    }
}
