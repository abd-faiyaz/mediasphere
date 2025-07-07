package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.ThreadLike;
import com.example.mediasphere_initial.model.ThreadDislike;
import com.example.mediasphere_initial.model.CommentLike;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.CommentRepository;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ThreadLikeRepository;
import com.example.mediasphere_initial.repository.ThreadDislikeRepository;
import com.example.mediasphere_initial.repository.CommentLikeRepository;
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

    @Autowired
    private ThreadLikeRepository threadLikeRepository;

    @Autowired
    private ThreadDislikeRepository threadDislikeRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private NotificationService notificationService;

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

        // Send notification to thread owner
        notificationService.notifyThreadComment(thread.getCreatedBy(), user, thread.getTitle(), thread.getId());

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

    public Map<String, Object> likeThread(UUID threadId, User user) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        // Check if user already liked this thread
        Optional<ThreadLike> existingLike = threadLikeRepository.findByThreadAndUser(thread, user);
        boolean wasLiked = existingLike.isPresent();

        // Remove dislike if exists
        Optional<ThreadDislike> existingDislike = threadDislikeRepository.findByThreadAndUser(thread, user);
        if (existingDislike.isPresent()) {
            threadDislikeRepository.delete(existingDislike.get());
            thread.setDislikeCount(Math.max(0, thread.getDislikeCount() - 1));
        }

        if (wasLiked) {
            // Unlike
            threadLikeRepository.delete(existingLike.get());
            thread.setLikeCount(Math.max(0, thread.getLikeCount() - 1));
        } else {
            // Like
            ThreadLike newLike = new ThreadLike(thread, user);
            threadLikeRepository.save(newLike);
            thread.setLikeCount(thread.getLikeCount() + 1);

            // Send notification to thread owner
            notificationService.notifyThreadLike(thread.getCreatedBy(), user, thread.getTitle(), thread.getId());
        }

        threadRepository.save(thread);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", !wasLiked);
        result.put("disliked", false);
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        return result;
    }

    public Map<String, Object> dislikeThread(UUID threadId, User user) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        // Check if user already disliked this thread
        Optional<ThreadDislike> existingDislike = threadDislikeRepository.findByThreadAndUser(thread, user);
        boolean wasDisliked = existingDislike.isPresent();

        // Remove like if exists
        Optional<ThreadLike> existingLike = threadLikeRepository.findByThreadAndUser(thread, user);
        if (existingLike.isPresent()) {
            threadLikeRepository.delete(existingLike.get());
            thread.setLikeCount(Math.max(0, thread.getLikeCount() - 1));
        }

        if (wasDisliked) {
            // Un-dislike
            threadDislikeRepository.delete(existingDislike.get());
            thread.setDislikeCount(Math.max(0, thread.getDislikeCount() - 1));
        } else {
            // Dislike
            ThreadDislike newDislike = new ThreadDislike(thread, user);
            threadDislikeRepository.save(newDislike);
            thread.setDislikeCount(thread.getDislikeCount() + 1);

            // Send notification to thread owner
            notificationService.notifyThreadDislike(thread.getCreatedBy(), user, thread.getTitle(), thread.getId());
        }

        threadRepository.save(thread);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", false);
        result.put("disliked", !wasDisliked);
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        return result;
    }

    public Map<String, Object> getLikeStatus(UUID threadId, User user) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        boolean liked = threadLikeRepository.existsByThreadAndUser(thread, user);
        boolean disliked = threadDislikeRepository.existsByThreadAndUser(thread, user);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("disliked", disliked);
        result.put("likeCount", thread.getLikeCount());
        result.put("dislikeCount", thread.getDislikeCount());
        return result;
    }

    public List<User> getThreadLikers(UUID threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        return threadLikeRepository.findByThread(thread)
                .stream()
                .map(ThreadLike::getUser)
                .toList();
    }

    public List<User> getThreadDislikers(UUID threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        return threadDislikeRepository.findByThread(thread)
                .stream()
                .map(ThreadDislike::getUser)
                .toList();
    }

    // Comment like methods
    public Map<String, Object> likeComment(UUID commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, user);

        Map<String, Object> result = new HashMap<>();

        if (existingLike.isPresent()) {
            // Unlike the comment
            commentLikeRepository.delete(existingLike.get());
            result.put("liked", false);
            result.put("message", "Comment unliked successfully");
        } else {
            // Like the comment
            CommentLike commentLike = new CommentLike(comment, user);
            commentLikeRepository.save(commentLike);
            result.put("liked", true);
            result.put("message", "Comment liked successfully");

            // Send notification to comment owner
            notificationService.notifyCommentLike(comment.getCreatedBy(), user, comment.getThread().getTitle(),
                    comment.getThread().getId());
        }

        long  likeCount = commentLikeRepository.countByComment(comment);
        comment.setLikeCount((int) likeCount);
        commentRepository.save(comment);

        result.put("likeCount", likeCount);

        return result;
    }

    public Map<String, Object> getCommentLikeStatus(UUID commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean liked = commentLikeRepository.existsByCommentAndUser(comment, user);
        long likeCount = commentLikeRepository.countByComment(comment);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("likeCount", likeCount);

        return result;
    }

    public List<User> getCommentLikers(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        return commentLikeRepository.findByComment(comment)
                .stream()
                .map(CommentLike::getUser)
                .toList();
    }
}
