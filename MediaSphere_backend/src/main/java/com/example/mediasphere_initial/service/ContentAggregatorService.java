package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.*;
import com.example.mediasphere_initial.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContentAggregatorService {
    
    @Autowired
    private MediaRepository mediaRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private ThreadRepository threadRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ContentFilterService contentFilterService;
    
    public ContentAggregationResult aggregateContentForSummary(UUID mediaId, UUID clubId, UUID threadId) {
        ContentAggregationResult result = new ContentAggregationResult();
        
        try {
            if (threadId != null) {
                // Thread-specific summary
                result = aggregateThreadContent(threadId);
                result.setSourceType("THREAD");
            } else if (clubId != null) {
                // Club-specific summary
                result = aggregateClubContent(clubId);
                result.setSourceType("CLUB");
            } else if (mediaId != null) {
                // Media-specific summary
                result = aggregateMediaContent(mediaId);
                result.setSourceType("MEDIA");
            } else {
                throw new IllegalArgumentException("At least one of mediaId, clubId, or threadId must be provided");
            }
            
            // Sanitize content
            String sanitizedContent = contentFilterService.sanitizeInput(result.getAggregatedContent());
            String limitedContent = contentFilterService.limitContentLength(sanitizedContent, 800); // ~200 words
            result.setAggregatedContent(limitedContent);
            
        } catch (Exception e) {
            log.error("Error aggregating content for summary", e);
            result.setError("Failed to aggregate content: " + e.getMessage());
        }
        
        return result;
    }
    
    private ContentAggregationResult aggregateThreadContent(UUID threadId) {
        ContentAggregationResult result = new ContentAggregationResult();
        
        com.example.mediasphere_initial.model.Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found: " + threadId));
        
        StringBuilder content = new StringBuilder();
        content.append("Thread Title: ").append(thread.getTitle()).append("\n");
        content.append("Thread Content: ").append(thread.getContent()).append("\n\n");
        
        // Get all comments for this thread
        List<Comment> comments = commentRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
        
        content.append("Discussion Comments:\n");
        for (Comment comment : comments) {
            content.append("- ").append(comment.getContent()).append("\n");
        }
        
        result.setAggregatedContent(content.toString());
        result.setSourceId(threadId);
        result.setSourceTitle(thread.getTitle());
        result.setItemCount(1 + comments.size()); // thread + comments
        
        return result;
    }
    
    private ContentAggregationResult aggregateClubContent(UUID clubId) {
        ContentAggregationResult result = new ContentAggregationResult();
        
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found: " + clubId));
        
        StringBuilder content = new StringBuilder();
        content.append("Club: ").append(club.getName()).append("\n");
        content.append("Club Description: ").append(club.getDescription()).append("\n\n");
        
        // Get all threads for this club
        List<com.example.mediasphere_initial.model.Thread> threads = threadRepository.findByClubIdOrderByCreatedAtDesc(clubId);
        
        content.append("Recent Discussions:\n");
        int threadCount = 0;
        for (com.example.mediasphere_initial.model.Thread thread : threads) {
            if (threadCount >= 10) break; // Limit to recent 10 threads
            
            content.append("Thread: ").append(thread.getTitle()).append("\n");
            content.append("Content: ").append(thread.getContent()).append("\n");
            
            // Get top comments for each thread
            List<Comment> topComments = commentRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId())
                    .stream().limit(3).collect(Collectors.toList());
            
            for (Comment comment : topComments) {
                content.append("  - Comment: ").append(comment.getContent()).append("\n");
            }
            content.append("\n");
            threadCount++;
        }
        
        result.setAggregatedContent(content.toString());
        result.setSourceId(clubId);
        result.setSourceTitle(club.getName());
        result.setItemCount(threads.size());
        
        return result;
    }
    
    private ContentAggregationResult aggregateMediaContent(UUID mediaId) {
        ContentAggregationResult result = new ContentAggregationResult();
        
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found: " + mediaId));
        
        StringBuilder content = new StringBuilder();
        content.append("Media: ").append(media.getTitle()).append("\n");
        content.append("Media Description: ").append(media.getDescription()).append("\n\n");
        
        // Get all clubs for this media
        List<Club> clubs = clubRepository.findByLinkedMediaIdOrderByCreatedAtDesc(mediaId);
        
        content.append("Related Clubs and Discussions:\n");
        int clubCount = 0;
        for (Club club : clubs) {
            if (clubCount >= 5) break; // Limit to top 5 clubs
            
            content.append("Club: ").append(club.getName()).append("\n");
            content.append("Description: ").append(club.getDescription()).append("\n");
            
            // Get recent threads for each club
            List<com.example.mediasphere_initial.model.Thread> recentThreads = threadRepository.findByClubIdOrderByCreatedAtDesc(club.getId())
                    .stream().limit(3).collect(Collectors.toList());
            
            for (com.example.mediasphere_initial.model.Thread thread : recentThreads) {
                content.append("  - Discussion: ").append(thread.getTitle()).append("\n");
                content.append("    ").append(thread.getContent()).append("\n");
            }
            content.append("\n");
            clubCount++;
        }
        
        result.setAggregatedContent(content.toString());
        result.setSourceId(mediaId);
        result.setSourceTitle(media.getTitle());
        result.setItemCount(clubs.size());
        
        return result;
    }
    
    public static class ContentAggregationResult {
        private String aggregatedContent;
        private String sourceType; // MEDIA, CLUB, THREAD
        private UUID sourceId;
        private String sourceTitle;
        private int itemCount;
        private String error;
        
        // Getters and setters
        public String getAggregatedContent() { return aggregatedContent; }
        public void setAggregatedContent(String aggregatedContent) { this.aggregatedContent = aggregatedContent; }
        
        public String getSourceType() { return sourceType; }
        public void setSourceType(String sourceType) { this.sourceType = sourceType; }
        
        public UUID getSourceId() { return sourceId; }
        public void setSourceId(UUID sourceId) { this.sourceId = sourceId; }
        
        public String getSourceTitle() { return sourceTitle; }
        public void setSourceTitle(String sourceTitle) { this.sourceTitle = sourceTitle; }
        
        public int getItemCount() { return itemCount; }
        public void setItemCount(int itemCount) { this.itemCount = itemCount; }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}
