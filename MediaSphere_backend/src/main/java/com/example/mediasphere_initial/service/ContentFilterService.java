package com.example.mediasphere_initial.service;

import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

@Service
public class ContentFilterService {
    
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern SPECIAL_CHARS_PATTERN = Pattern.compile("[^\\w\\s.,!?\\-()'\"]");
    private static final int MAX_CONTENT_LENGTH = 4000; // Approximate token limit
    
    public String sanitizeInput(String content) {
        if (content == null || content.trim().isEmpty()) {
            return "";
        }
        
        // Remove HTML tags
        content = HTML_TAG_PATTERN.matcher(content).replaceAll(" ");
        
        // Remove special characters but keep basic punctuation
        content = SPECIAL_CHARS_PATTERN.matcher(content).replaceAll(" ");
        
        // Normalize whitespace
        content = content.replaceAll("\\s+", " ").trim();
        
        return content;
    }
    
    public String limitContentLength(String content, int maxTokens) {
        if (content == null) return "";
        
        // Rough estimate: 4 characters = 1 token
        int maxChars = Math.min(maxTokens * 4, MAX_CONTENT_LENGTH);
        
        if (content.length() <= maxChars) {
            return content;
        }
        
        // Truncate at word boundary
        String truncated = content.substring(0, maxChars);
        int lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > maxChars * 0.8) { // If we can find a reasonable word boundary
            truncated = truncated.substring(0, lastSpace);
        }
        
        return truncated + "...";
    }
    
    public String filterResponse(String aiResponse) {
        if (aiResponse == null) return "";
        
        // Basic response filtering
        aiResponse = aiResponse.trim();
        
        // Remove any error indicators that might confuse users
        aiResponse = aiResponse.replaceAll("(?i)(error|fail|cannot process)", "unable to analyze");
        
        return aiResponse;
    }
    
    public String generateContentHash(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // Fallback to simple hash
            return String.valueOf(content.hashCode());
        }
    }
}
