package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIPromptRequest {
    private String mediaId;
    private String clubId;
    private String threadId;
    private String context;
    private String requestType; // SUMMARY, QUIZ, ANALYSIS, RECOMMENDATION
    private int numberOfPrompts = 5;
}
