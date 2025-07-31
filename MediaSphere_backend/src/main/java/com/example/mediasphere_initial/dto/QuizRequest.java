package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequest extends AIPromptRequest {
    private int numberOfQuestions = 5;
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD, MIXED
    private String questionType = "MULTIPLE_CHOICE"; // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, MIXED
    private boolean includeExplanations = true;
    private int timeLimit = 0; // in minutes, 0 = no time limit
    
    public QuizRequest(String mediaId, String clubId, String threadId, int numberOfQuestions, String difficulty) {
        super(mediaId, clubId, threadId, null, "QUIZ", numberOfQuestions);
        this.numberOfQuestions = numberOfQuestions;
        this.difficulty = difficulty;
    }
}
