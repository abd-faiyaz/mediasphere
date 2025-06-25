package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Notification;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.NotificationService;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    // Get user notifications
    @GetMapping("/")
    public ResponseEntity<?> getUserNotifications(@RequestHeader("Authorization") String authHeader,
                                                  @RequestParam(required = false) Boolean unreadOnly) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            List<Notification> notifications;
            if (unreadOnly != null && unreadOnly) {
                notifications = notificationService.getUnreadNotifications(userOpt.get());
            } else {
                notifications = notificationService.getAllUserNotifications(userOpt.get());
            }
            
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get notification details
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotification(@PathVariable UUID id,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Optional<Notification> notification = notificationService.getNotificationById(id);
            if (notification.isPresent() && notification.get().getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.ok(notification.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update a notification (mark as read, update content)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable UUID id,
                                              @RequestBody Notification updatedNotification,
                                              @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Notification notification = notificationService.updateNotification(id, updatedNotification, userOpt.get());
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Mark all notifications as read
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            notificationService.markAllAsRead(userOpt.get());
            return ResponseEntity.ok("All notifications marked as read");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            long count = notificationService.getUnreadCount(userOpt.get());
            return ResponseEntity.ok(java.util.Map.of("count", count));
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
