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
@Table(name = "ai_generated_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIGeneratedContent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;
    
    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;
    
    @Column(name = "content_data", nullable = false, columnDefinition = "TEXT")
    private String contentData;
    
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;
    
    @Column(name = "source_reference_id")
    private UUID sourceReferenceId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "source_reference_type")
    private SourceReferenceType sourceReferenceType;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ContentType {
        SUMMARY, QUIZ_QUESTIONS, SENTIMENT_ANALYSIS, TOPIC_EXTRACTION, KEY_INSIGHTS, RECOMMENDATIONS
    }
    
    public enum SourceReferenceType {
        MEDIA, CLUB, THREAD
    }
}
