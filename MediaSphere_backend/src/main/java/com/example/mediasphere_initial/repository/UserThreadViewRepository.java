package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.UserThreadView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserThreadViewRepository extends JpaRepository<UserThreadView, UUID> {
    
    /**
     * Check if a user has already viewed a specific thread
     */
    Optional<UserThreadView> findByUserAndThread(User user, Thread thread);
    
    /**
     * Check if a user has viewed a thread by user ID and thread ID
     */
    boolean existsByUserIdAndThreadId(UUID userId, UUID threadId);
}
