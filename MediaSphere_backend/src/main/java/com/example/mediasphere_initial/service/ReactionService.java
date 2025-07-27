package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.UserThreadReaction;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.UserThreadView;
import com.example.mediasphere_initial.repository.UserThreadReactionRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.UserThreadViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class ReactionService {

    @Autowired
    private UserThreadReactionRepository reactionRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private UserThreadViewRepository viewRepository;

    @Autowired
    private TrendingService trendingService;

    /**
     * Toggle like reaction on a thread
     */
    @Transactional
    public Map<String, Object> likeThread(Thread thread, User user) {
        Optional<UserThreadReaction> existingReaction = reactionRepository.findByUserAndThread(user, thread);
        
        Map<String, Object> result = new HashMap<>();
        boolean isLiked = false;
        boolean isDisliked = false;

        if (existingReaction.isPresent()) {
            UserThreadReaction reaction = existingReaction.get();
            
            if (reaction.getReactionType() == UserThreadReaction.ReactionType.LIKE) {
                // Remove existing like
                reactionRepository.delete(reaction);
                thread.setLikeCount(Math.max(0, thread.getLikeCount() - 1));
                isLiked = false;
            } else {
                // Change from dislike to like
                reaction.setReactionType(UserThreadReaction.ReactionType.LIKE);
                reactionRepository.save(reaction);
                thread.setLikeCount(thread.getLikeCount() + 1);
                thread.setDislikeCount(Math.max(0, thread.getDislikeCount() - 1));
                isLiked = true;
            }
        } else {
            // Create new like
            UserThreadReaction newReaction = new UserThreadReaction(user, thread, UserThreadReaction.ReactionType.LIKE);
            reactionRepository.save(newReaction);
            thread.setLikeCount(thread.getLikeCount() + 1);
            isLiked = true;
        }

        // Update thread activity and save
        trendingService.updateLastActivity(thread);
        threadRepository.save(thread);

        result.put("isLiked", isLiked);
        result.put("isDisliked", isDisliked);
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        
        return result;
    }

    /**
     * Toggle dislike reaction on a thread
     */
    @Transactional
    public Map<String, Object> dislikeThread(Thread thread, User user) {
        Optional<UserThreadReaction> existingReaction = reactionRepository.findByUserAndThread(user, thread);
        
        Map<String, Object> result = new HashMap<>();
        boolean isLiked = false;
        boolean isDisliked = false;

        if (existingReaction.isPresent()) {
            UserThreadReaction reaction = existingReaction.get();
            
            if (reaction.getReactionType() == UserThreadReaction.ReactionType.DISLIKE) {
                // Remove existing dislike
                reactionRepository.delete(reaction);
                thread.setDislikeCount(Math.max(0, thread.getDislikeCount() - 1));
                isDisliked = false;
            } else {
                // Change from like to dislike
                reaction.setReactionType(UserThreadReaction.ReactionType.DISLIKE);
                reactionRepository.save(reaction);
                thread.setDislikeCount(thread.getDislikeCount() + 1);
                thread.setLikeCount(Math.max(0, thread.getLikeCount() - 1));
                isDisliked = true;
            }
        } else {
            // Create new dislike
            UserThreadReaction newReaction = new UserThreadReaction(user, thread, UserThreadReaction.ReactionType.DISLIKE);
            reactionRepository.save(newReaction);
            thread.setDislikeCount(thread.getDislikeCount() + 1);
            isDisliked = true;
        }

        // Update thread activity and save
        trendingService.updateLastActivity(thread);
        threadRepository.save(thread);

        result.put("isLiked", isLiked);
        result.put("isDisliked", isDisliked);
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        
        return result;
    }

    /**
     * Get user's reaction to a thread
     */
    public Map<String, Object> getUserReaction(Thread thread, User user) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<UserThreadReaction> reaction = reactionRepository.findByUserAndThread(user, thread);
        
        if (reaction.isPresent()) {
            UserThreadReaction.ReactionType type = reaction.get().getReactionType();
            result.put("isLiked", type == UserThreadReaction.ReactionType.LIKE);
            result.put("isDisliked", type == UserThreadReaction.ReactionType.DISLIKE);
        } else {
            result.put("isLiked", false);
            result.put("isDisliked", false);
        }
        
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        
        return result;
    }

    /**
     * Get user reactions for multiple threads (for feed display)
     */
    public Map<String, Map<String, Object>> getUserReactionsForThreads(List<Thread> threads, User user) {
        Map<String, Map<String, Object>> reactionsMap = new HashMap<>();
        
        if (user == null) {
            // Return default values for anonymous users
            for (Thread thread : threads) {
                Map<String, Object> reactionData = new HashMap<>();
                reactionData.put("isLiked", false);
                reactionData.put("isDisliked", false);
                reactionData.put("likeCount", thread.getLikeCount());
                reactionData.put("dislikeCount", thread.getDislikeCount());
                reactionsMap.put(thread.getId().toString(), reactionData);
            }
            return reactionsMap;
        }

        // Get all user reactions for these threads in one query
        List<UserThreadReaction> userReactions = reactionRepository.findByUserAndThreads(user, threads);
        Map<String, UserThreadReaction> reactionsByThreadId = new HashMap<>();
        
        for (UserThreadReaction reaction : userReactions) {
            reactionsByThreadId.put(reaction.getThread().getId().toString(), reaction);
        }

        // Build reaction data for each thread
        for (Thread thread : threads) {
            Map<String, Object> reactionData = new HashMap<>();
            String threadId = thread.getId().toString();
            
            UserThreadReaction userReaction = reactionsByThreadId.get(threadId);
            if (userReaction != null) {
                UserThreadReaction.ReactionType type = userReaction.getReactionType();
                reactionData.put("isLiked", type == UserThreadReaction.ReactionType.LIKE);
                reactionData.put("isDisliked", type == UserThreadReaction.ReactionType.DISLIKE);
            } else {
                reactionData.put("isLiked", false);
                reactionData.put("isDisliked", false);
            }
            
            reactionData.put("likeCount", thread.getLikeCount());
            reactionData.put("dislikeCount", thread.getDislikeCount());
            
            reactionsMap.put(threadId, reactionData);
        }
        
        return reactionsMap;
    }

    /**
     * Update thread view count and track last activity
     */
    @Transactional
    public void incrementViewCount(Thread thread) {
        thread.setViewCount(thread.getViewCount() + 1);
        trendingService.updateLastActivity(thread);
        threadRepository.save(thread);
    }

    /**
     * Track a view for a specific user (unique views only)
     */
    @Transactional
    public boolean trackUserView(Thread thread, User user) {
        // Check if user has already viewed this thread
        Optional<UserThreadView> existingView = viewRepository.findByUserAndThread(user, thread);
        
        if (existingView.isPresent()) {
            // User has already viewed this thread, don't increment count
            return false;
        }
        
        // Create new view record
        UserThreadView view = new UserThreadView(user, thread);
        viewRepository.save(view);
        
        // Increment view count and update activity
        thread.setViewCount(thread.getViewCount() + 1);
        trendingService.updateLastActivity(thread);
        threadRepository.save(thread);
        
        return true;
    }
}
