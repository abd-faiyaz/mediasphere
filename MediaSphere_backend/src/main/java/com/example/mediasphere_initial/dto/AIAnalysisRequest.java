package com.example.mediasphere_initial.dto;

public class AIAnalysisRequest {
    private String content;
    private String analysisType; // "characters", "themes", "sentiment"
    private String mediaId;
    
    public AIAnalysisRequest() {}
    
    public AIAnalysisRequest(String content, String analysisType, String mediaId) {
        this.content = content;
        this.analysisType = analysisType;
        this.mediaId = mediaId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
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
}
