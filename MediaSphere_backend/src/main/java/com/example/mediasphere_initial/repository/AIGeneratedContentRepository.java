package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.AIGeneratedContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIGeneratedContentRepository extends JpaRepository<AIGeneratedContent, UUID> {
    
    Optional<AIGeneratedContent> findByContentHashAndContentType(String contentHash, AIGeneratedContent.ContentType contentType);
    
    List<AIGeneratedContent> findByContentTypeAndSourceReferenceTypeAndSourceReferenceId(
            AIGeneratedContent.ContentType contentType,
            AIGeneratedContent.SourceReferenceType sourceReferenceType,
            UUID sourceReferenceId
    );
    
    @Query("SELECT agc FROM AIGeneratedContent agc WHERE agc.expiresAt IS NOT NULL AND agc.expiresAt < :now")
    List<AIGeneratedContent> findExpiredContent(@Param("now") LocalDateTime now);
    
    @Query("SELECT agc FROM AIGeneratedContent agc WHERE agc.contentType = :contentType AND agc.createdAt >= :since ORDER BY agc.createdAt DESC")
    List<AIGeneratedContent> findRecentContentByType(@Param("contentType") AIGeneratedContent.ContentType contentType, 
                                                    @Param("since") LocalDateTime since);
    
    void deleteByExpiresAtBefore(LocalDateTime expiredBefore);
}
