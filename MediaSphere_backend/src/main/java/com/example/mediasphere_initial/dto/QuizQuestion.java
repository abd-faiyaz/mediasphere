package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
    private String question;
    private String type; // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
    private List<String> options; // For multiple choice questions
    private String correctAnswer;
    private String explanation;
    private int points = 1;
    private String difficulty; // EASY, MEDIUM, HARD
    
    public QuizQuestion(String question, String type, String correctAnswer) {
        this.question = question;
        this.type = type;
        this.correctAnswer = correctAnswer;
    }
}
