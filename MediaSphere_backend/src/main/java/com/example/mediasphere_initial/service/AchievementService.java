package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserAchievement;
import com.example.mediasphere_initial.model.UserStatistics;
import com.example.mediasphere_initial.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AchievementService {

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserStatisticsRepository userStatisticsRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserClubRepository userClubRepository;

    // Award achievement if user doesn't already have it
    public UserAchievement awardAchievement(User user, String achievementType, String title, String description,
            String icon) {
        if (!userAchievementRepository.existsByUserAndAchievementType(user, achievementType)) {
            UserAchievement achievement = new UserAchievement(user, achievementType, title, description, icon);
            return userAchievementRepository.save(achievement);
        }
        return null;
    }

    // Check for club-related achievements
    public void checkClubJoinedAchievements(User user) {
        long clubCount = userClubRepository.countByUser(user);

        if (clubCount == 1) {
            awardAchievement(user, "first_club", "Community Explorer", "Joined your first club!", "🏠");
        } else if (clubCount == 5) {
            awardAchievement(user, "club_enthusiast", "Club Enthusiast", "Joined 5 clubs!", "🌟");
        } else if (clubCount >= 10) {
            awardAchievement(user, "community_champion", "Community Champion", "Joined 10+ clubs!", "👑");
        }
    }

    // Check for thread-related achievements
    public void checkThreadCreatedAchievements(User user) {
        long threadCount = threadRepository.countByCreatedBy(user);

        if (threadCount == 1) {
            awardAchievement(user, "first_thread", "Discussion Starter", "Created your first discussion!", "💬");
        } else if (threadCount == 10) {
            awardAchievement(user, "active_discusser", "Active Discusser", "Created 10 discussions!", "🗣️");
        } else if (threadCount >= 50) {
            awardAchievement(user, "conversation_master", "Conversation Master", "Created 50+ discussions!", "🎯");
        }
    }

    // Check for comment-related achievements
    public void checkCommentPostedAchievements(User user) {
        long commentCount = commentRepository.countByCreatedBy(user);

        if (commentCount == 1) {
            awardAchievement(user, "first_comment", "First Voice", "Posted your first comment!", "✨");
        } else if (commentCount == 25) {
            awardAchievement(user, "helpful_member", "Helpful Member", "Posted 25 comments!", "🤝");
        } else if (commentCount >= 100) {
            awardAchievement(user, "super_contributor", "Super Contributor", "Posted 100+ comments!", "🚀");
        }
    }

    // Get all achievements for a user
    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUserOrderByEarnedAtDesc(user);
    }

    // Get achievement count for a user
    public long getUserAchievementCount(User user) {
        return userAchievementRepository.countByUser(user);
    }

    // Check if user has specific achievement
    public boolean hasAchievement(User user, String achievementType) {
        return userAchievementRepository.existsByUserAndAchievementType(user, achievementType);
    }

    // Award welcome achievement for new users
    public void awardWelcomeAchievement(User user) {
        awardAchievement(user, "welcome", "Welcome to MediaSphere!", "Welcome to our community!", "🎉");
    }

    // Calculate and update user statistics
    public UserStatistics updateUserStatistics(User user) {
        Optional<UserStatistics> existingStats = userStatisticsRepository.findByUser(user);
        UserStatistics stats;

        if (existingStats.isPresent()) {
            stats = existingStats.get();
        } else {
            stats = new UserStatistics(user);
        }

        // Recalculate statistics
        stats.setThreadsCreated((int) threadRepository.countByCreatedBy(user));
        stats.setCommentsPosted((int) commentRepository.countByCreatedBy(user));
        stats.setClubsJoined((int) userClubRepository.countByUser(user));
        stats.updateTimestamp();

        return userStatisticsRepository.save(stats);
    }

    // Get or create user statistics
    public UserStatistics getUserStatistics(User user) {
        Optional<UserStatistics> stats = userStatisticsRepository.findByUser(user);
        if (stats.isPresent()) {
            return stats.get();
        } else {
            return updateUserStatistics(user);
        }
    }
}
