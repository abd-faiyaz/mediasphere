package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionRequest {
    private String quizId;
    private Map<Integer, String> answers; // questionIndex -> userAnswer
    private long startTime; // timestamp when quiz was started
    private long endTime; // timestamp when quiz was completed
}
