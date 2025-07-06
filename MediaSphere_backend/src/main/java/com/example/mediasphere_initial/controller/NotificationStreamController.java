package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.AuthService;
import com.example.mediasphere_initial.service.NotificationStreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationStreamController {

    @Autowired
    private NotificationStreamService notificationStreamService;

    @Autowired
    private AuthService authService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@RequestParam String token) {
        try {
            // Validate token and get user
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                SseEmitter emitter = new SseEmitter();
                emitter.completeWithError(new RuntimeException("Invalid token"));
                return emitter;
            }

            User user = userOpt.get();

            // Create SSE emitter for this user
            SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // No timeout

            // Register the emitter for this user
            notificationStreamService.addEmitter(user.getId(), emitter);

            // Handle cleanup when connection closes
            emitter.onCompletion(() -> notificationStreamService.removeEmitter(user.getId(), emitter));
            emitter.onTimeout(() -> notificationStreamService.removeEmitter(user.getId(), emitter));
            emitter.onError((ex) -> notificationStreamService.removeEmitter(user.getId(), emitter));

            // Send initial connection confirmation
            try {
                emitter.send(SseEmitter.event()
                        .name("connected")
                        .data("{\"message\": \"Connected to real-time notifications\"}"));
            } catch (Exception e) {
                // Connection might be closed already
            }

            return emitter;

        } catch (Exception e) {
            SseEmitter emitter = new SseEmitter();
            emitter.completeWithError(e);
            return emitter;
        }
    }
}
