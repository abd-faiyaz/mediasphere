package com.example.mediasphere_initial.dto;

public class AIQuizRequest {
    private String mediaId;
    private String difficulty = "medium";
    private int numberOfQuestions = 10;
    private String questionType = "multiple-choice";
    
    public AIQuizRequest() {}
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public int getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(int numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }
    
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
}
