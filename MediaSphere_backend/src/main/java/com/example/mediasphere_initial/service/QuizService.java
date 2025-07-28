package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.dto.*;
import com.example.mediasphere_initial.model.AIRequest;
import com.example.mediasphere_initial.service.ContentAggregatorService.ContentAggregationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class QuizService {
    
    @Autowired
    private ContentAggregatorService contentAggregatorService;
    
    @Autowired
    private GeminiAPIService geminiAPIService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public QuizResponse generateQuiz(QuizRequest request, UUID userId) {
        try {
            log.info("Generating quiz for user: {}, request: {}", userId, request);
            
            // Validate request
            if (request.getMediaId() == null && request.getClubId() == null && request.getThreadId() == null) {
                return new QuizResponse(false, "At least one of mediaId, clubId, or threadId must be provided");
            }
            
            if (request.getNumberOfQuestions() < 1 || request.getNumberOfQuestions() > 50) {
                return new QuizResponse(false, "Number of questions must be between 1 and 50");
            }
            
            // Aggregate content based on scope
            ContentAggregationResult aggregationResult = contentAggregatorService.aggregateContentForSummary(
                parseUUID(request.getMediaId()), 
                parseUUID(request.getClubId()), 
                parseUUID(request.getThreadId())
            );
            
            if (aggregationResult.getError() != null) {
                return new QuizResponse(false, "Content aggregation failed: " + aggregationResult.getError());
            }
            
            // Create AI prompt for quiz generation
            String prompt = createQuizPrompt(aggregationResult, request);
            
            // Call Gemini AI
            String aiResponse = geminiAPIService.callGeminiWithFallback(prompt, userId, AIRequest.RequestType.QUIZ);
            
            // Process and structure the response
            QuizResponse response = processQuizResponse(aiResponse, aggregationResult, request);
            response.setSuccess(true);
            response.setGeneratedAt(LocalDateTime.now());
            
            log.info("Quiz generated successfully for user: {}", userId);
            return response;
            
        } catch (Exception e) {
            log.error("Error generating quiz for user: {}", userId, e);
            return new QuizResponse(false, "Failed to generate quiz: " + e.getMessage());
        }
    }
    
    private String createQuizPrompt(ContentAggregationResult aggregationResult, QuizRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Create a ").append(request.getDifficulty().toLowerCase()).append(" difficulty quiz ");
        prompt.append("with ").append(request.getNumberOfQuestions()).append(" questions ");
        prompt.append("based on the following ").append(aggregationResult.getSourceType().toLowerCase()).append(" content. ");
        
        String questionType = request.getQuestionType();
        if ("MIXED".equals(questionType)) {
            prompt.append("Use a mix of multiple choice, true/false, and short answer questions. ");
        } else {
            prompt.append("Create ").append(questionType.toLowerCase().replace("_", " ")).append(" questions. ");
        }
        
        if (request.isIncludeExplanations()) {
            prompt.append("Include explanations for each answer. ");
        }
        
        prompt.append("Focus on key concepts, important details, and comprehension.\n\n");
        
        prompt.append("Content for quiz creation:\n");
        prompt.append(aggregationResult.getAggregatedContent());
        
        prompt.append("\n\nFormat your response as JSON with this structure:\n");
        prompt.append("{\n");
        prompt.append("  \"title\": \"Quiz title\",\n");
        prompt.append("  \"instructions\": \"Brief instructions for taking the quiz\",\n");
        prompt.append("  \"estimatedTime\": number_in_minutes,\n");
        prompt.append("  \"questions\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"question\": \"Question text\",\n");
        prompt.append("      \"type\": \"MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER\",\n");
        prompt.append("      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], // only for multiple choice\n");
        prompt.append("      \"correctAnswer\": \"Correct answer\",\n");
        prompt.append("      \"explanation\": \"Why this is correct\",\n");
        prompt.append("      \"difficulty\": \"EASY|MEDIUM|HARD\",\n");
        prompt.append("      \"points\": 1\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
    
    private QuizResponse processQuizResponse(String aiResponse, ContentAggregationResult aggregationResult, QuizRequest request) {
        QuizResponse response = new QuizResponse();
        
        try {
            // Try to parse as JSON first
            JsonNode jsonResponse = objectMapper.readTree(aiResponse);
            
            response.setQuizTitle(jsonResponse.get("title").asText());
            response.setInstructions(jsonResponse.get("instructions").asText());
            response.setEstimatedTime(jsonResponse.get("estimatedTime").asInt());
            
            List<QuizQuestion> questions = new ArrayList<>();
            JsonNode questionsNode = jsonResponse.get("questions");
            
            for (JsonNode questionNode : questionsNode) {
                QuizQuestion question = new QuizQuestion();
                question.setQuestion(questionNode.get("question").asText());
                question.setType(questionNode.get("type").asText());
                question.setCorrectAnswer(questionNode.get("correctAnswer").asText());
                question.setExplanation(questionNode.get("explanation").asText());
                question.setDifficulty(questionNode.get("difficulty").asText());
                question.setPoints(questionNode.get("points").asInt());
                
                // Handle options for multiple choice
                if ("MULTIPLE_CHOICE".equals(question.getType()) && questionNode.has("options")) {
                    List<String> options = new ArrayList<>();
                    for (JsonNode optionNode : questionNode.get("options")) {
                        options.add(optionNode.asText());
                    }
                    question.setOptions(options);
                }
                
                questions.add(question);
            }
            
            response.setQuestions(questions);
            
        } catch (Exception e) {
            log.warn("Failed to parse quiz JSON response, falling back to text parsing", e);
            // Fallback to text parsing if JSON fails
            response = parseQuizFromText(aiResponse, request);
        }
        
        // Set metadata
        response.setSourceType(aggregationResult.getSourceType());
        response.setSourceTitle(aggregationResult.getSourceTitle());
        response.setTotalQuestions(response.getQuestions().size());
        response.setDifficulty(request.getDifficulty());
        response.setFromCache(false);
        
        return response;
    }
    
    private QuizResponse parseQuizFromText(String aiResponse, QuizRequest request) {
        QuizResponse response = new QuizResponse();
        List<QuizQuestion> questions = new ArrayList<>();
        
        // Simple text parsing as fallback
        String[] lines = aiResponse.split("\n");
        QuizQuestion currentQuestion = null;
        List<String> currentOptions = new ArrayList<>();
        
        for (String line : lines) {
            line = line.trim();
            
            if (line.matches("^\\d+\\..*")) {
                // Save previous question
                if (currentQuestion != null) {
                    if (!currentOptions.isEmpty()) {
                        currentQuestion.setOptions(new ArrayList<>(currentOptions));
                    }
                    questions.add(currentQuestion);
                }
                
                // Start new question
                currentQuestion = new QuizQuestion();
                currentQuestion.setQuestion(line.replaceFirst("^\\d+\\.", "").trim());
                currentQuestion.setType("MULTIPLE_CHOICE");
                currentQuestion.setDifficulty(request.getDifficulty());
                currentQuestion.setPoints(1);
                currentOptions.clear();
            } else if (line.matches("^[A-D]\\).*")) {
                // Multiple choice option
                currentOptions.add(line.substring(2).trim());
            } else if (line.toLowerCase().startsWith("answer:")) {
                if (currentQuestion != null) {
                    currentQuestion.setCorrectAnswer(line.substring(7).trim());
                }
            } else if (line.toLowerCase().startsWith("explanation:")) {
                if (currentQuestion != null) {
                    currentQuestion.setExplanation(line.substring(12).trim());
                }
            }
        }
        
        // Add last question
        if (currentQuestion != null) {
            if (!currentOptions.isEmpty()) {
                currentQuestion.setOptions(new ArrayList<>(currentOptions));
            }
            questions.add(currentQuestion);
        }
        
        response.setQuestions(questions);
        response.setQuizTitle("Generated Quiz");
        response.setInstructions("Answer all questions to the best of your ability.");
        response.setEstimatedTime(questions.size() * 2); // 2 minutes per question
        
        return response;
    }
    
    private UUID parseUUID(String uuidString) {
        if (uuidString == null || uuidString.trim().isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(uuidString);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", uuidString);
            return null;
        }
    }
}
