package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.UserAchievement;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, UUID> {

    // Get all achievements for a user
    List<UserAchievement> findByUserOrderByEarnedAtDesc(User user);

    // Check if user has a specific achievement
    Optional<UserAchievement> findByUserAndAchievementType(User user, String achievementType);

    // Check if user has an achievement
    boolean existsByUserAndAchievementType(User user, String achievementType);

    // Count achievements for a user
    long countByUser(User user);

    // Get users with a specific achievement
    List<UserAchievement> findByAchievementType(String achievementType);
}
