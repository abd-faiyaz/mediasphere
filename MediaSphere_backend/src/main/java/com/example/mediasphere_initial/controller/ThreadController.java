package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.ThreadService;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/threads")
@CrossOrigin(origins = "http://localhost:3000")
public class ThreadController {

    @Autowired
    private ThreadService threadService;

    @Autowired
    private AuthService authService;

    // List all threads across all clubs
    @GetMapping("/")
    public ResponseEntity<List<Thread>> getAllThreads() {
        List<Thread> threads = threadService.getAllThreads();
        return ResponseEntity.ok(threads);
    }

    // Get trending threads
    @GetMapping("/trending")
    public ResponseEntity<List<Thread>> getTrendingThreads() {
        List<Thread> trendingThreads = threadService.getTrendingThreads();
        return ResponseEntity.ok(trendingThreads);
    }

    // Get all threads created by a specific user
    @GetMapping("/user/{user_id}")
    public ResponseEntity<List<Thread>> getUserThreads(@PathVariable("user_id") UUID userId) {
        List<Thread> userThreads = threadService.getUserThreads(userId);
        return ResponseEntity.ok(userThreads);
    }

    // Get detailed information about a specific thread
    @GetMapping("/{id}")
    public ResponseEntity<Thread> getThread(@PathVariable UUID id) {
        Optional<Thread> thread = threadService.getThreadById(id);
        if (thread.isPresent()) {
            threadService.incrementViewCount(id);
            return ResponseEntity.ok(thread.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Update thread details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateThread(@PathVariable UUID id,
                                         @RequestBody Thread thread,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Thread updatedThread = threadService.updateThread(id, thread, userOpt.get());
            return ResponseEntity.ok(updatedThread);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete a thread
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteThread(@PathVariable UUID id,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            boolean deleted = threadService.deleteThread(id, userOpt.get());
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(403).body("Unauthorized to delete thread");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get thread statistics
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getThreadStats(@PathVariable UUID id) {
        try {
            Map<String, Object> stats = threadService.getThreadStats(id);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all comments for a thread
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getThreadComments(@PathVariable UUID id) {
        List<Comment> comments = threadService.getThreadComments(id);
        return ResponseEntity.ok(comments);
    }

    // Add a new comment to a thread
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable UUID id,
                                       @RequestBody Comment comment,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Comment createdComment = threadService.addComment(id, comment, userOpt.get());
            return ResponseEntity.status(201).body(createdComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update a comment
    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(@PathVariable UUID id,
                                          @RequestBody Comment comment,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Comment updatedComment = threadService.updateComment(id, comment, userOpt.get());
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete a comment
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable UUID id,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            boolean deleted = threadService.deleteComment(id, userOpt.get());
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(403).body("Unauthorized to delete comment");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Optional<User> getUserFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.getUserFromToken(token);
        }
        return Optional.empty();
    }
}
