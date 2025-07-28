package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionResponse {
    private boolean success;
    private String message;
    private int score;
    private int totalQuestions;
    private double percentage;
    private List<QuestionResult> results;
    private long completionTime; // in seconds
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private int questionIndex;
        private String userAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private String explanation;
        private int points;
    }
}
