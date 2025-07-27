package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Thread;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class TrendingService {

    private static final double LIKE_WEIGHT = 1.0;
    private static final double COMMENT_WEIGHT = 2.0;
    private static final double VIEW_WEIGHT = 0.1;
    private static final double DISLIKE_PENALTY = 0.5;
    private static final double TIME_DECAY_HOURS = 24.0; // Half-life in hours

    /**
     * Calculate trending score for a thread
     * Formula: (likes - (dislikes * penalty)) * 1.0 + comments * 2.0 + views * 0.1) * time_decay_factor
     */
    public double calculateTrendingScore(Thread thread) {
        if (thread == null) {
            return 0.0;
        }

        // Get engagement metrics (handle nulls)
        int likes = thread.getLikeCount() != null ? thread.getLikeCount() : 0;
        int dislikes = thread.getDislikeCount() != null ? thread.getDislikeCount() : 0;
        int comments = thread.getCommentCount() != null ? thread.getCommentCount() : 0;
        int views = thread.getViewCount() != null ? thread.getViewCount() : 0;

        // Calculate base engagement score
        double engagementScore = (likes - (dislikes * DISLIKE_PENALTY)) * LIKE_WEIGHT 
                               + comments * COMMENT_WEIGHT 
                               + views * VIEW_WEIGHT;

        // Calculate time decay factor
        double timeDecayFactor = calculateTimeDecayFactor(thread);

        // Final trending score
        double trendingScore = engagementScore * timeDecayFactor;

        // Ensure non-negative score
        return Math.max(0.0, trendingScore);
    }

    /**
     * Calculate time decay factor based on thread's last activity
     * More recent activity gets higher weight
     */
    private double calculateTimeDecayFactor(Thread thread) {
        LocalDateTime activityTime = thread.getLastActivityAt() != null 
            ? thread.getLastActivityAt() 
            : thread.getCreatedAt();

        if (activityTime == null) {
            return 0.1; // Very low weight for threads without timestamps
        }

        // Calculate hours since last activity
        long hoursSinceActivity = ChronoUnit.HOURS.between(activityTime, LocalDateTime.now());

        // Exponential decay: factor = 0.5^(hours / half_life)
        double decayFactor = Math.pow(0.5, hoursSinceActivity / TIME_DECAY_HOURS);

        // Minimum decay factor to prevent scores from becoming too small
        return Math.max(0.01, decayFactor);
    }

    /**
     * Update thread's last activity timestamp
     * Call this when thread receives new comments, likes, or views
     */
    public void updateLastActivity(Thread thread) {
        if (thread != null) {
            thread.setLastActivityAt(LocalDateTime.now());
        }
    }

    /**
     * Check if a thread should be considered "hot" based on recent activity
     */
    public boolean isHotThread(Thread thread) {
        if (thread == null) {
            return false;
        }

        LocalDateTime activityTime = thread.getLastActivityAt() != null 
            ? thread.getLastActivityAt() 
            : thread.getCreatedAt();

        if (activityTime == null) {
            return false;
        }

        // Consider "hot" if activity within last 6 hours and has significant engagement
        long hoursSinceActivity = ChronoUnit.HOURS.between(activityTime, LocalDateTime.now());
        int totalEngagement = (thread.getLikeCount() != null ? thread.getLikeCount() : 0) +
                             (thread.getCommentCount() != null ? thread.getCommentCount() : 0);

        return hoursSinceActivity <= 6 && totalEngagement >= 5;
    }
}
