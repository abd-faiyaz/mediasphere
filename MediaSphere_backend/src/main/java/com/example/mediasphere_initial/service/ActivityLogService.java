package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.*;
import com.example.mediasphere_initial.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private AchievementService achievementService;

    // Log activity when user joins a club
    public void logMemberJoined(UUID userId, UUID clubId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Club> club = clubRepository.findById(clubId);

        if (user.isPresent() && club.isPresent()) {
            ActivityLog activity = new ActivityLog(
                    user.get(),
                    club.get(),
                    "member_joined",
                    user.get().getFirstName() + " " + user.get().getLastName() + " joined the club");
            activityLogRepository.save(activity);

            // Check for achievements
            achievementService.checkClubJoinedAchievements(user.get());
        }
    }

    // Log activity when a thread is created
    public void logThreadCreated(UUID userId, UUID clubId, UUID threadId, String threadTitle) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Club> club = clubRepository.findById(clubId);

        if (user.isPresent() && club.isPresent()) {
            ActivityLog activity = new ActivityLog(
                    user.get(),
                    club.get(),
                    "thread_created",
                    "New discussion started: " + threadTitle,
                    threadId,
                    "thread");
            activityLogRepository.save(activity);

            // Check for achievements
            achievementService.checkThreadCreatedAchievements(user.get());
        }
    }

    // Log activity when an event is created
    public void logEventCreated(UUID userId, UUID clubId, UUID eventId, String eventTitle) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Club> club = clubRepository.findById(clubId);

        if (user.isPresent() && club.isPresent()) {
            ActivityLog activity = new ActivityLog(
                    user.get(),
                    club.get(),
                    "event_created",
                    "New event scheduled: " + eventTitle,
                    eventId,
                    "event");
            activityLogRepository.save(activity);
        }
    }

    // Log activity when a comment is posted
    public void logCommentPosted(UUID userId, UUID clubId, UUID threadId, String threadTitle) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Club> club = clubRepository.findById(clubId);

        if (user.isPresent() && club.isPresent()) {
            ActivityLog activity = new ActivityLog(
                    user.get(),
                    club.get(),
                    "comment_posted",
                    "Commented on: " + threadTitle,
                    threadId,
                    "thread");
            activityLogRepository.save(activity);

            // Check for achievements
            achievementService.checkCommentPostedAchievements(user.get());
        }
    }

    // Get recent activity for a club (last 10)
    public List<ActivityLog> getRecentClubActivity(UUID clubId) {
        Optional<Club> club = clubRepository.findById(clubId);
        if (club.isPresent()) {
            return activityLogRepository.findTop10ByClubOrderByCreatedAtDesc(club.get());
        }
        return List.of();
    }

    // Get paginated activity for a club
    public Page<ActivityLog> getClubActivity(UUID clubId, int page, int size) {
        Optional<Club> club = clubRepository.findById(clubId);
        if (club.isPresent()) {
            Pageable pageable = PageRequest.of(page, size);
            return activityLogRepository.findByClubOrderByCreatedAtDesc(club.get(), pageable);
        }
        return Page.empty();
    }

    // Get user activity
    public Page<ActivityLog> getUserActivity(UUID userId, int page, int size) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            Pageable pageable = PageRequest.of(page, size);
            return activityLogRepository.findByUserOrderByCreatedAtDesc(user.get(), pageable);
        }
        return Page.empty();
    }

    // Get global recent activity
    public Page<ActivityLog> getGlobalActivity(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // Get activity stats
    public long getActivityCountByType(String activityType) {
        return activityLogRepository.countByActivityType(activityType);
    }

    public long getUserActivityCount(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(activityLogRepository::countByUser).orElse(0L);
    }

    public long getClubActivityCount(UUID clubId) {
        Optional<Club> club = clubRepository.findById(clubId);
        return club.map(activityLogRepository::countByClub).orElse(0L);
    }

    // Log activity when user leaves a club
    public void logMemberLeft(UUID userId, UUID clubId, String reason) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Club> club = clubRepository.findById(clubId);

        if (user.isPresent() && club.isPresent()) {
            String description = user.get().getFirstName() + " " + user.get().getLastName() + " left the club";
            if (reason != null && !reason.trim().isEmpty()) {
                description += " (Reason: " + reason.substring(0, Math.min(reason.length(), 50)) +
                        (reason.length() > 50 ? "..." : "") + ")";
            }

            ActivityLog activity = new ActivityLog(
                    user.get(),
                    club.get(),
                    "member_left",
                    description,
                    null,
                    "membership");
            activityLogRepository.save(activity);
        }
    }
}
