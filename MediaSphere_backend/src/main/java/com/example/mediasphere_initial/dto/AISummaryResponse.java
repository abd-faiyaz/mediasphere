package com.example.mediasphere_initial.dto;

import java.util.List;

public class AISummaryResponse {
    private String mediaId;
    private String chapter;
    private String episode;
    private String summary;
    private List<String> keyPoints;
    private int originalLength;
    private int summaryLength;
    
    public AISummaryResponse() {}
    
    public AISummaryResponse(String mediaId, String summary, int originalLength, int summaryLength) {
        this.mediaId = mediaId;
        this.summary = summary;
        this.originalLength = originalLength;
        this.summaryLength = summaryLength;
    }
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }
    
    public String getEpisode() { return episode; }
    public void setEpisode(String episode) { this.episode = episode; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) { this.keyPoints = keyPoints; }
    
    public int getOriginalLength() { return originalLength; }
    public void setOriginalLength(int originalLength) { this.originalLength = originalLength; }
    
    public int getSummaryLength() { return summaryLength; }
    public void setSummaryLength(int summaryLength) { this.summaryLength = summaryLength; }
}
