package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.AIRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AIRequestRepository extends JpaRepository<AIRequest, UUID> {
    
    List<AIRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<AIRequest> findByUserIdAndRequestTypeOrderByCreatedAtDesc(UUID userId, AIRequest.RequestType requestType);
    
    List<AIRequest> findByStatusOrderByCreatedAtDesc(AIRequest.Status status);
    
    @Query("SELECT ar FROM AIRequest ar WHERE ar.userId = :userId AND ar.requestType = :requestType AND ar.status = 'COMPLETED' AND ar.createdAt >= :since ORDER BY ar.createdAt DESC")
    List<AIRequest> findRecentSuccessfulRequests(@Param("userId") UUID userId, 
                                                @Param("requestType") AIRequest.RequestType requestType, 
                                                @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(ar) FROM AIRequest ar WHERE ar.userId = :userId AND ar.createdAt >= :since")
    long countUserRequestsSince(@Param("userId") UUID userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT ar FROM AIRequest ar WHERE ar.status = 'PENDING' AND ar.createdAt < :timeout ORDER BY ar.createdAt")
    List<AIRequest> findTimedOutRequests(@Param("timeout") LocalDateTime timeout);
}
