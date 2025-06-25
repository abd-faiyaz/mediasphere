package com.example.mediasphere_initial.dto;

public class AIPromptRequest {
    private String mediaId;
    private String context;
    private int numberOfPrompts = 5;
    
    public AIPromptRequest() {}
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    
    public int getNumberOfPrompts() { return numberOfPrompts; }
    public void setNumberOfPrompts(int numberOfPrompts) { this.numberOfPrompts = numberOfPrompts; }
}
