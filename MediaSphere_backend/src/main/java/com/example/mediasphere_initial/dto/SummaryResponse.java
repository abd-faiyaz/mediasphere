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
public class SummaryResponse extends BaseAIResponse {
    private String summary;
    private int wordCount;
    private List<String> keyTopics;
    private String sourceType; // MEDIA, CLUB, THREAD
    private String sourceTitle;
    
    public SummaryResponse(boolean success, String message) {
        super(success, message);
    }
}
