package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.UserStatistics;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStatisticsRepository extends JpaRepository<UserStatistics, UUID> {

    // Find statistics by user
    Optional<UserStatistics> findByUser(User user);

    // Find or create statistics for a user
    @Query("SELECT us FROM UserStatistics us WHERE us.user = :user")
    Optional<UserStatistics> findByUserWithCreate(@Param("user") User user);

    // Update threads created count
    @Modifying
    @Query("UPDATE UserStatistics us SET us.threadsCreated = us.threadsCreated + :increment, us.updatedAt = CURRENT_TIMESTAMP WHERE us.user = :user")
    void incrementThreadsCreated(@Param("user") User user, @Param("increment") int increment);

    // Update comments posted count
    @Modifying
    @Query("UPDATE UserStatistics us SET us.commentsPosted = us.commentsPosted + :increment, us.updatedAt = CURRENT_TIMESTAMP WHERE us.user = :user")
    void incrementCommentsPosted(@Param("user") User user, @Param("increment") int increment);

    // Update clubs joined count
    @Modifying
    @Query("UPDATE UserStatistics us SET us.clubsJoined = us.clubsJoined + :increment, us.updatedAt = CURRENT_TIMESTAMP WHERE us.user = :user")
    void incrementClubsJoined(@Param("user") User user, @Param("increment") int increment);

    // Update likes received count
    @Modifying
    @Query("UPDATE UserStatistics us SET us.likesReceived = us.likesReceived + :increment, us.updatedAt = CURRENT_TIMESTAMP WHERE us.user = :user")
    void incrementLikesReceived(@Param("user") User user, @Param("increment") int increment);

    // Recalculate statistics for a user
    @Modifying
    @Query("""
                UPDATE UserStatistics us SET
                us.threadsCreated = (SELECT COUNT(t) FROM Thread t WHERE t.createdBy = :user),
                us.commentsPosted = (SELECT COUNT(c) FROM Comment c WHERE c.createdBy = :user),
                us.clubsJoined = (SELECT COUNT(uc) FROM UserClub uc WHERE uc.user = :user),
                us.updatedAt = CURRENT_TIMESTAMP
                WHERE us.user = :user
            """)
    void recalculateStatistics(@Param("user") User user);
}
