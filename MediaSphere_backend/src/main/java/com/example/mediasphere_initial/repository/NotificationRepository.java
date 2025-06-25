package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Notification;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);
    long countByUserAndIsRead(User user, Boolean isRead);
}
