package com.example.mediasphere_initial.dto;

import java.util.List;

public class AIQuizResponse {
    private String mediaId;
    private String difficulty;
    private List<QuizQuestion> questions;
    
    public AIQuizResponse() {}
    
    public AIQuizResponse(String mediaId, String difficulty, List<QuizQuestion> questions) {
        this.mediaId = mediaId;
        this.difficulty = difficulty;
        this.questions = questions;
    }
    
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public List<QuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }
    
    public static class QuizQuestion {
        private String question;
        private List<String> options;
        private int correctAnswer;
        private String explanation;
        
        public QuizQuestion() {}
        
        public QuizQuestion(String question, List<String> options, int correctAnswer, String explanation) {
            this.question = question;
            this.options = options;
            this.correctAnswer = correctAnswer;
            this.explanation = explanation;
        }
        
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        
        public int getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(int correctAnswer) { this.correctAnswer = correctAnswer; }
        
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
