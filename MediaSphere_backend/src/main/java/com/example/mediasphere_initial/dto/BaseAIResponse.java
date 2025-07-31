package com.example.mediasphere_initial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseAIResponse {
    private boolean success;
    private String message;
    private LocalDateTime generatedAt;
    private String requestId;
    private boolean fromCache;
    private int processingTimeMs;
    
    public BaseAIResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.generatedAt = LocalDateTime.now();
        this.fromCache = false;
    }
}
