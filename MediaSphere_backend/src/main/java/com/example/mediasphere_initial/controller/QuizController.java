package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.dto.*;
import com.example.mediasphere_initial.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
    
    @Autowired
    private QuizService quizService;
    
    @PostMapping("/generate")
    public ResponseEntity<QuizResponse> generateQuiz(@RequestBody QuizRequest request) {
        try {
            // For now, use a dummy user ID. In production, extract from JWT token
            UUID userId = UUID.randomUUID(); // TODO: Get from authentication context
            
            QuizResponse response = quizService.generateQuiz(request, userId);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            QuizResponse errorResponse = new QuizResponse(false, "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<QuizSubmissionResponse> submitQuiz(@RequestBody QuizSubmissionRequest request) {
        try {
            // TODO: Implement quiz submission logic
            // For now, return a placeholder response
            QuizSubmissionResponse response = new QuizSubmissionResponse();
            response.setSuccess(true);
            response.setMessage("Quiz submitted successfully (placeholder)");
            response.setScore(0);
            response.setTotalQuestions(0);
            response.setPercentage(0.0);
            response.setCompletionTime(0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            QuizSubmissionResponse errorResponse = new QuizSubmissionResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testQuizEndpoint() {
        return ResponseEntity.ok("Quiz service is available");
    }
}
