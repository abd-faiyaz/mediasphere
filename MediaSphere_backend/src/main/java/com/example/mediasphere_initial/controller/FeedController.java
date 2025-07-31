package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.service.FeedService;
import com.example.mediasphere_initial.service.ReactionService;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private ReactionService reactionService;

    @Autowired
    private AuthService authService;

    /**
     * Get personalized feed for authenticated user
     * If no user ID provided, returns trending feed
     */
    @GetMapping("/personalized")
    public ResponseEntity<Page<Thread>> getPersonalizedFeed(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            User user = null;

            // Get user if userId is provided
            if (userId != null && !userId.trim().isEmpty()) {
                Optional<User> userOpt = userRepository.findByClerkUserId(userId);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                }
            }

            Page<Thread> feed = feedService.getPersonalizedFeed(user, pageable);
            return ResponseEntity.ok(feed);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get trending feed (anonymous/public feed)
     */
    @GetMapping("/trending")
    public ResponseEntity<Page<Thread>> getTrendingFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Thread> feed = feedService.getTrendingFeed(pageable);
            return ResponseEntity.ok(feed);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get hot threads (high recent activity)
     */
    @GetMapping("/hot")
    public ResponseEntity<Page<Thread>> getHotFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Thread> feed = feedService.getHotFeed(pageable);
            return ResponseEntity.ok(feed);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get new threads (recently created)
     */
    @GetMapping("/new")
    public ResponseEntity<Page<Thread>> getNewFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Thread> feed = feedService.getNewFeed(pageable);
            return ResponseEntity.ok(feed);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Feed service is running");
    }

    /**
     * Like a thread
     */
    @PostMapping("/threads/{threadId}/like")
    public ResponseEntity<?> likeThread(@PathVariable UUID threadId,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (!threadOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> result = reactionService.likeThread(threadOpt.get(), userOpt.get());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to like thread");
        }
    }

    /**
     * Dislike a thread
     */
    @PostMapping("/threads/{threadId}/dislike")
    public ResponseEntity<?> dislikeThread(@PathVariable UUID threadId,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (!threadOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> result = reactionService.dislikeThread(threadOpt.get(), userOpt.get());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to dislike thread");
        }
    }

    /**
     * Get user's reaction to a thread
     */
    @GetMapping("/threads/{threadId}/reaction")
    public ResponseEntity<Map<String, Object>> getThreadReaction(@PathVariable UUID threadId,
                                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (!threadOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = null;
            if (authHeader != null) {
                Optional<User> userOpt = getUserFromToken(authHeader);
                user = userOpt.orElse(null);
            }

            Map<String, Object> result = reactionService.getUserReaction(threadOpt.get(), user);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Track thread view
     */
    @PostMapping("/threads/{threadId}/view")
    public ResponseEntity<?> trackView(@PathVariable UUID threadId, HttpServletRequest request) {
        try {
            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (!threadOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Thread thread = threadOpt.get();
            String authHeader = request.getHeader("Authorization");
            
            // Try to get authenticated user for unique view tracking
            Optional<User> userOpt = getUserFromToken(authHeader);
            
            if (userOpt.isPresent()) {
                // Authenticated user - track unique view
                boolean isNewView = reactionService.trackUserView(thread, userOpt.get());
                Map<String, Object> response = new HashMap<>();
                response.put("isNewView", isNewView);
                response.put("viewCount", thread.getViewCount());
                return ResponseEntity.ok(response);
            } else {
                // Anonymous user - just increment count
                reactionService.incrementViewCount(thread);
                Map<String, Object> response = new HashMap<>();
                response.put("isNewView", true);
                response.put("viewCount", thread.getViewCount());
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to track view");
        }
    }

    /**
     * Helper method to extract user from JWT token
     */
    private Optional<User> getUserFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.getUserFromToken(token);
        }
        return Optional.empty();
    }
}
