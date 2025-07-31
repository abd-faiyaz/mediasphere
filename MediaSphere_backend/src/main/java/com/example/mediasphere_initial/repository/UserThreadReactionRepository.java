package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.UserThreadReaction;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Thread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserThreadReactionRepository extends JpaRepository<UserThreadReaction, UUID> {
    
    Optional<UserThreadReaction> findByUserAndThread(User user, Thread thread);
    
    List<UserThreadReaction> findByUser(User user);
    
    List<UserThreadReaction> findByThread(Thread thread);
    
    @Query("SELECT COUNT(r) FROM UserThreadReaction r WHERE r.thread = :thread AND r.reactionType = :reactionType")
    long countByThreadAndReactionType(@Param("thread") Thread thread, 
                                    @Param("reactionType") UserThreadReaction.ReactionType reactionType);
    
    @Query("SELECT r FROM UserThreadReaction r WHERE r.user = :user AND r.thread IN :threads")
    List<UserThreadReaction> findByUserAndThreads(@Param("user") User user, @Param("threads") List<Thread> threads);
    
    void deleteByUserAndThread(User user, Thread thread);
}
