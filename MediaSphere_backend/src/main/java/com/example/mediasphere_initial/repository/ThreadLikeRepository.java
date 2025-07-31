package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.ThreadLike;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThreadLikeRepository extends JpaRepository<ThreadLike, UUID> {

    // Check if user has liked a thread
    Optional<ThreadLike> findByThreadAndUser(Thread thread, User user);

    // Check if user has liked a thread (boolean)
    boolean existsByThreadAndUser(Thread thread, User user);

    // Count likes for a thread
    long countByThread(Thread thread);

    // Get all users who liked a thread
    List<ThreadLike> findByThread(Thread thread);

    // Get all threads liked by a user
    List<ThreadLike> findByUser(User user);

    // Count total likes received by a user (across all their threads)
    @Query("SELECT COUNT(tl) FROM ThreadLike tl WHERE tl.thread.createdBy = :user")
    long countLikesReceivedByUser(@Param("user") User user);

    // Get threads with most likes
    @Query("SELECT tl.thread, COUNT(tl) as likeCount FROM ThreadLike tl GROUP BY tl.thread ORDER BY likeCount DESC")
    List<Object[]> findThreadsWithMostLikes();
}
