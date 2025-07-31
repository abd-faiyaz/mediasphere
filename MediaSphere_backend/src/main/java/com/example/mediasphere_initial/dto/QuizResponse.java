package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse extends BaseAIResponse {
    private String quizTitle;
    private String sourceType; // MEDIA, CLUB, THREAD
    private String sourceTitle;
    private List<QuizQuestion> questions;
    private int totalQuestions;
    private int estimatedTime; // in minutes
    private String difficulty;
    private String instructions;
    
    public QuizResponse(boolean success, String message) {
        super(success, message);
    }
}
