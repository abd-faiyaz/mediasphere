package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Notification;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public Optional<Notification> getNotificationById(UUID id) {
        return notificationRepository.findById(id);
    }

    public Notification updateNotification(UUID notificationId, Notification updatedNotification, User user) {
        Notification existingNotification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Check if the notification belongs to the user
        if (!existingNotification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update notification");
        }

        // Only allow updating isRead status and content (if allowed)
        if (updatedNotification.getIsRead() != null) {
            existingNotification.setIsRead(updatedNotification.getIsRead());
        }
        
        return notificationRepository.save(existingNotification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public Notification createNotification(User user, String title, String content, String type, UUID referenceId, String referenceType) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUser(user);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }

    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
