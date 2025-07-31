package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.ThreadDislike;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThreadDislikeRepository extends JpaRepository<ThreadDislike, UUID> {

    // Check if user has disliked a thread
    Optional<ThreadDislike> findByThreadAndUser(Thread thread, User user);

    // Check if user has disliked a thread (boolean)
    boolean existsByThreadAndUser(Thread thread, User user);

    // Count dislikes for a thread
    long countByThread(Thread thread);

    // Get all users who disliked a thread
    List<ThreadDislike> findByThread(Thread thread);

    // Get all threads disliked by a user
    List<ThreadDislike> findByUser(User user);
}
