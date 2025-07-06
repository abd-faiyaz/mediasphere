package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationStreamService {

    private final Map<UUID, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void addEmitter(UUID userId, SseEmitter emitter) {
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
    }

    public void removeEmitter(UUID userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    public void sendNotificationToUser(UUID userId, Notification notification) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            // Create a copy to avoid concurrent modification
            List<SseEmitter> emittersCopy = new CopyOnWriteArrayList<>(emitters);

            for (SseEmitter emitter : emittersCopy) {
                try {
                    String notificationJson = objectMapper.writeValueAsString(notification);
                    emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(notificationJson));
                } catch (Exception e) {
                    // Remove failed emitter
                    removeEmitter(userId, emitter);
                    try {
                        emitter.complete();
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }

    public void sendNotificationToAllUsers(Notification notification) {
        for (Map.Entry<UUID, List<SseEmitter>> entry : userEmitters.entrySet()) {
            sendNotificationToUser(entry.getKey(), notification);
        }
    }

    public boolean hasActiveConnections(UUID userId) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        return emitters != null && !emitters.isEmpty();
    }

    public int getActiveConnectionsCount() {
        return userEmitters.values().stream()
                .mapToInt(List::size)
                .sum();
    }
}
