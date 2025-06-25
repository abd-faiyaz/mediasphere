package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.CommentRepository;
import com.example.mediasphere_initial.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class ThreadService {

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Thread> getAllThreads() {
        return threadRepository.findAll();
    }

    public List<Thread> getTrendingThreads() {
        return threadRepository.findTrendingThreads();
    }

    public List<Thread> getUserThreads(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return threadRepository.findByCreatedBy(user);
    }

    public Optional<Thread> getThreadById(UUID id) {
        return threadRepository.findById(id);
    }

    public void incrementViewCount(UUID threadId) {
        Optional<Thread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isPresent()) {
            Thread thread = threadOpt.get();
            thread.setViewCount(thread.getViewCount() + 1);
            threadRepository.save(thread);
        }
    }

    public Thread updateThread(UUID threadId, Thread updatedThread, User user) {
        Thread existingThread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        // Check if user is the creator or admin
        if (!existingThread.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized to update thread");
        }

        existingThread.setTitle(updatedThread.getTitle());
        existingThread.setContent(updatedThread.getContent());
        existingThread.setUpdatedAt(LocalDateTime.now());
        
        return threadRepository.save(existingThread);
    }

    public boolean deleteThread(UUID threadId, User user) {
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        // Check if user is the creator or admin
        if (!thread.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return false;
        }

        threadRepository.delete(thread);
        return true;
    }

    public Map<String, Object> getThreadStats(UUID threadId) {
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("id", thread.getId());
        stats.put("title", thread.getTitle());
        stats.put("viewCount", thread.getViewCount());
        stats.put("commentCount", thread.getCommentCount());
        stats.put("createdAt", thread.getCreatedAt());
        stats.put("isPinned", thread.getIsPinned());
        stats.put("isLocked", thread.getIsLocked());
        
        return stats;
    }

    public List<Comment> getThreadComments(UUID threadId) {
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        return commentRepository.findByThread(thread);
    }

    public Comment addComment(UUID threadId, Comment comment, User user) {
        Thread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new RuntimeException("Thread not found"));
        
        comment.setId(UUID.randomUUID());
        comment.setThread(thread);
        comment.setCreatedBy(user);
        comment.setCreatedAt(LocalDateTime.now());
        
        Comment savedComment = commentRepository.save(comment);
        
        // Update thread comment count
        thread.setCommentCount(thread.getCommentCount() + 1);
        threadRepository.save(thread);
        
        return savedComment;
    }

    public Comment updateComment(UUID commentId, Comment updatedComment, User user) {
        Comment existingComment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user is the creator or admin
        if (!existingComment.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized to update comment");
        }

        existingComment.setContent(updatedComment.getContent());
        existingComment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(existingComment);
    }

    public boolean deleteComment(UUID commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user is the creator or admin
        if (!comment.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return false;
        }

        Thread thread = comment.getThread();
        
        commentRepository.delete(comment);
        
        // Update thread comment count
        thread.setCommentCount(Math.max(0, thread.getCommentCount() - 1));
        threadRepository.save(thread);
        
        return true;
    }

    public List<Thread> searchThreads(String keyword) {
        return threadRepository.searchByTitleOrContent(keyword);
    }
}
