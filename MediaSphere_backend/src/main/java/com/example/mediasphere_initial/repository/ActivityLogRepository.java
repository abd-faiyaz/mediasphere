package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.ActivityLog;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    // Get recent activity for a specific user
    Page<ActivityLog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // Get recent activity for a specific club
    Page<ActivityLog> findByClubOrderByCreatedAtDesc(Club club, Pageable pageable);

    // Get recent activity for a club (last 10 activities)
    List<ActivityLog> findTop10ByClubOrderByCreatedAtDesc(Club club);

    // Get global recent activity
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Get activity by type for a user
    List<ActivityLog> findByUserAndActivityTypeOrderByCreatedAtDesc(User user, String activityType);

    // Get activity by date range
    @Query("SELECT al FROM ActivityLog al WHERE al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    List<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Count activities by user
    long countByUser(User user);

    // Count activities by club
    long countByClub(Club club);

    // Count activities by type
    long countByActivityType(String activityType);
}
