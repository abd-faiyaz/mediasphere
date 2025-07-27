package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByThread(Thread thread);

    List<Comment> findByCreatedBy(User user);

    List<Comment> findByParentComment(Comment parentComment);

    long countByCreatedBy(User user);
    
    // Additional methods for AI summary functionality
    List<Comment> findByThreadIdOrderByCreatedAtAsc(UUID threadId);
    
    List<Comment> findByThreadOrderByCreatedAtAsc(Thread thread);
}
