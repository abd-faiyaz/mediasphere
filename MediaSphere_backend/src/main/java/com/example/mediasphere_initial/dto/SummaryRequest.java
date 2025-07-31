package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SummaryRequest extends AIPromptRequest {
    private String summaryType = "DETAILED"; // BRIEF, DETAILED
    private int maxWords = 200;
    private boolean includeTopics = true;
    
    public SummaryRequest(String mediaId, String clubId, String threadId) {
        super(mediaId, clubId, threadId, null, "SUMMARY", 1);
    }
}
