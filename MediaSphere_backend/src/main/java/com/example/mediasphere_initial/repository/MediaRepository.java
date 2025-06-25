package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByMediaType(MediaType mediaType);
    
    @Query("SELECT m FROM Media m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Media> searchByTitleOrDescription(@Param("keyword") String keyword);
    
    @Query("SELECT m FROM Media m WHERE m.mediaType = :mediaType AND (LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Media> searchByMediaTypeAndKeyword(@Param("mediaType") MediaType mediaType, @Param("keyword") String keyword);
}
