package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.EventInterest;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventInterestRepository extends JpaRepository<EventInterest, UUID> {

    // Check if a user is interested in an event
    Optional<EventInterest> findByEventIdAndUserId(UUID eventId, UUID userId);

    // Get all users interested in an event
    @Query("SELECT ei.user FROM EventInterest ei WHERE ei.event.id = :eventId ORDER BY ei.createdAt DESC")
    List<User> findUsersByEventId(@Param("eventId") UUID eventId);

    // Count interested users for an event
    long countByEventId(UUID eventId);

    // Get all event interests for a user
    List<EventInterest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Delete interest by event and user
    void deleteByEventIdAndUserId(UUID eventId, UUID userId);
}
