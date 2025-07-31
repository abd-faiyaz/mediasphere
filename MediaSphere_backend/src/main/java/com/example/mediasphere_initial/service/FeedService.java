package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedService {

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private UserClubRepository userClubRepository;

    @Autowired
    private TrendingService trendingService;

    @Autowired
    private ReactionService reactionService;

    /**
     * Get personalized feed for authenticated user
     * Shows posts from user's joined clubs first, then other trending posts
     */
    public Page<Thread> getPersonalizedFeed(User user, Pageable pageable) {
        if (user == null) {
            return getTrendingFeed(pageable);
        }

        // Get user's joined clubs
        List<UserClub> userClubs = userClubRepository.findByUser(user);
        List<UUID> joinedClubIds = userClubs.stream()
            .map(uc -> uc.getClub().getId())
            .collect(Collectors.toList());

        if (joinedClubIds.isEmpty()) {
            // User hasn't joined any clubs, show trending feed
            return getTrendingFeed(pageable);
        }

        // Get all threads
        List<Thread> allThreads = threadRepository.findAll();

        // Separate threads by user's club membership
        List<Thread> joinedClubThreads = new ArrayList<>();
        List<Thread> otherThreads = new ArrayList<>();

        for (Thread thread : allThreads) {
            if (thread.getClub() != null && joinedClubIds.contains(thread.getClub().getId())) {
                joinedClubThreads.add(thread);
            } else {
                otherThreads.add(thread);
            }
        }

        // Sort joined club threads by recency (most recent first)
        joinedClubThreads.sort((t1, t2) -> {
            LocalDateTime time1 = t1.getLastActivityAt() != null ? t1.getLastActivityAt() : t1.getCreatedAt();
            LocalDateTime time2 = t2.getLastActivityAt() != null ? t2.getLastActivityAt() : t2.getCreatedAt();
            return time2.compareTo(time1); // Descending order
        });

        // Sort other threads by trending score
        otherThreads.sort((t1, t2) -> Double.compare(
            trendingService.calculateTrendingScore(t2),
            trendingService.calculateTrendingScore(t1)
        ));

        // Combine the lists: joined club threads first, then trending threads
        List<Thread> combinedFeed = new ArrayList<>();
        combinedFeed.addAll(joinedClubThreads);
        combinedFeed.addAll(otherThreads);

        // Apply pagination
        return paginateThreads(combinedFeed, pageable);
    }

    /**
     * Get trending feed for anonymous users or as fallback
     * Shows posts ordered by trending score
     */
    public Page<Thread> getTrendingFeed(Pageable pageable) {
        // Get all threads
        List<Thread> allThreads = threadRepository.findAll();

        // Calculate trending scores and sort
        List<Thread> trendingThreads = allThreads.stream()
            .filter(thread -> thread.getClub() != null) // Only include threads with valid clubs
            .sorted((t1, t2) -> Double.compare(
                trendingService.calculateTrendingScore(t2),
                trendingService.calculateTrendingScore(t1)
            ))
            .collect(Collectors.toList());

        return paginateThreads(trendingThreads, pageable);
    }

    /**
     * Get hot threads (high recent activity)
     */
    public Page<Thread> getHotFeed(Pageable pageable) {
        List<Thread> allThreads = threadRepository.findAll();

        List<Thread> hotThreads = allThreads.stream()
            .filter(trendingService::isHotThread)
            .sorted((t1, t2) -> Double.compare(
                trendingService.calculateTrendingScore(t2),
                trendingService.calculateTrendingScore(t1)
            ))
            .collect(Collectors.toList());

        return paginateThreads(hotThreads, pageable);
    }

    /**
     * Get new threads (recently created)
     */
    public Page<Thread> getNewFeed(Pageable pageable) {
        List<Thread> allThreads = threadRepository.findAll();

        List<Thread> newThreads = allThreads.stream()
            .filter(thread -> thread.getClub() != null)
            .sorted((t1, t2) -> {
                LocalDateTime time1 = t1.getCreatedAt();
                LocalDateTime time2 = t2.getCreatedAt();
                if (time1 == null && time2 == null) return 0;
                if (time1 == null) return 1;
                if (time2 == null) return -1;
                return time2.compareTo(time1); // Most recent first
            })
            .collect(Collectors.toList());

        return paginateThreads(newThreads, pageable);
    }

    /**
     * Helper method to apply pagination to a list of threads
     */
    private Page<Thread> paginateThreads(List<Thread> threads, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), threads.size());

        if (start > threads.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, threads.size());
        }

        List<Thread> pageContent = threads.subList(start, end);
        return new PageImpl<>(pageContent, pageable, threads.size());
    }

    /**
     * Update thread activity when it receives engagement
     */
    public void updateThreadActivity(Thread thread) {
        trendingService.updateLastActivity(thread);
        threadRepository.save(thread);
    }

    /**
     * Enrich threads with user reaction data for personalized feed display
     */
    private Page<Thread> enrichThreadsWithReactions(Page<Thread> threadPage, User user) {
        List<Thread> threads = threadPage.getContent();
        
        if (threads.isEmpty()) {
            return threadPage;
        }

        // This method doesn't modify the threads directly since we can't add 
        // reaction data to the Thread entity. The frontend will need to make 
        // separate calls to get reaction data, or we would need to create 
        // a separate DTO class for feed responses.
        
        return threadPage;
    }
}
