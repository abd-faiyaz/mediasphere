package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClubRepository extends JpaRepository<Club, UUID> {
    @Query("SELECT c FROM Club c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Club> searchByNameOrDescription(@Param("keyword") String keyword);
    
    // Find clubs by linked media
    List<Club> findByLinkedMedia(Media linkedMedia);
    
    // Additional methods for AI summary functionality
    List<Club> findByLinkedMediaIdOrderByCreatedAtDesc(UUID mediaId);
    
    @Query("SELECT c FROM Club c WHERE c.linkedMedia.id = :mediaId ORDER BY c.createdAt DESC")
    List<Club> findByLinkedMediaIdOrderByCreatedAtDescCustom(@Param("mediaId") UUID mediaId);
}