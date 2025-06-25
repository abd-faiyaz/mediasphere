package com.example.mediasphere_initial.dto;

import java.util.List;

public class AIRecommendationResponse {
    private String userId;
    private String mediaType;
    private List<RecommendedItem> recommendations;
    private String algorithm;
    private double confidence;
    
    public AIRecommendationResponse() {}
    
    public AIRecommendationResponse(String userId, List<RecommendedItem> recommendations, String algorithm, double confidence) {
        this.userId = userId;
        this.recommendations = recommendations;
        this.algorithm = algorithm;
        this.confidence = confidence;
    }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    
    public List<RecommendedItem> getRecommendations() { return recommendations; }
    public void setRecommendations(List<RecommendedItem> recommendations) { this.recommendations = recommendations; }
    
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    
    public static class RecommendedItem {
        private String mediaId;
        private String title;
        private String type;
        private double score;
        private String reason;
        
        public RecommendedItem() {}
        
        public RecommendedItem(String mediaId, String title, String type, double score, String reason) {
            this.mediaId = mediaId;
            this.title = title;
            this.type = type;
            this.score = score;
            this.reason = reason;
        }
        
        public String getMediaId() { return mediaId; }
        public void setMediaId(String mediaId) { this.mediaId = mediaId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
