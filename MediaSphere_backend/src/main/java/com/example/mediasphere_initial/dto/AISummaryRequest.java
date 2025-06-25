package com.example.mediasphere_initial.dto;

public class AISummaryRequest {
    private String mediaId;
    private String chapter;
    private String episode;
    private String content;
    private int maxLength = 200;
    
    public AISummaryRequest() {}
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }
    
    public String getEpisode() { return episode; }
    public void setEpisode(String episode) { this.episode = episode; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public int getMaxLength() { return maxLength; }
    public void setMaxLength(int maxLength) { this.maxLength = maxLength; }
}
