package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private RequestType requestType;
    
    @Column(name = "request_data", nullable = false, columnDefinition = "TEXT")
    private String requestData;
    
    @Column(name = "response_data", columnDefinition = "TEXT")
    private String responseData;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum RequestType {
        SUMMARY, QUIZ, ANALYSIS, RECOMMENDATION
    }
    
    public enum Status {
        PENDING, COMPLETED, FAILED
    }
}
