package com.example.mediasphere_initial.dto;

import java.util.List;

public class AIPromptResponse {
    private String mediaId;
    private List<String> prompts;
    private String context;
    
    public AIPromptResponse() {}
    
    public AIPromptResponse(String mediaId, List<String> prompts, String context) {
        this.mediaId = mediaId;
        this.prompts = prompts;
        this.context = context;
    }
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public List<String> getPrompts() { return prompts; }
    public void setPrompts(List<String> prompts) { this.prompts = prompts; }
    
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}
