package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ThreadRepository extends JpaRepository<Thread, UUID> {
    @Query("SELECT DISTINCT t FROM Thread t LEFT JOIN FETCH t.images WHERE t.club = :club ORDER BY t.createdAt DESC")
    List<Thread> findByClub(@Param("club") Club club);

    List<Thread> findByCreatedBy(User user);

    long countByCreatedBy(User user);

    @Query("SELECT t FROM Thread t ORDER BY t.viewCount DESC, t.commentCount DESC")
    List<Thread> findTrendingThreads();

    @Query("SELECT t FROM Thread t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Thread> searchByTitleOrContent(@Param("keyword") String keyword);
    
    // Additional methods for AI summary functionality
    List<Thread> findByClubIdOrderByCreatedAtDesc(UUID clubId);
    
    @Query("SELECT t FROM Thread t WHERE t.club.id = :clubId ORDER BY t.createdAt DESC")
    List<Thread> findByClubIdOrderByCreatedAtDescCustom(@Param("clubId") UUID clubId);
}
