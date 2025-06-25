package com.example.mediasphere_initial.dto;

import java.util.List;
import java.util.Map;

public class AIAnalysisResponse {
    private String analysisType;
    private String mediaId;
    private List<String> characters;
    private List<String> themes;
    private Map<String, Double> sentimentScores;
    private String summary;
    private double confidence;
    
    public AIAnalysisResponse() {}
    
    public AIAnalysisResponse(String analysisType, String mediaId, String summary, double confidence) {
        this.analysisType = analysisType;
        this.mediaId = mediaId;
        this.summary = summary;
        this.confidence = confidence;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getMediaId() {
        return mediaId;
    }
    
    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
    }
    
    public List<String> getCharacters() {
        return characters;
    }
    
    public void setCharacters(List<String> characters) {
        this.characters = characters;
    }
    
    public List<String> getThemes() {
        return themes;
    }
    
    public void setThemes(List<String> themes) {
        this.themes = themes;
    }
    
    public Map<String, Double> getSentimentScores() {
        return sentimentScores;
    }
    
    public void setSentimentScores(Map<String, Double> sentimentScores) {
        this.sentimentScores = sentimentScores;
    }
    
    public String getSummary() {
        return summary;
    }
    
    public void setSummary(String summary) {
        this.summary = summary;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}
