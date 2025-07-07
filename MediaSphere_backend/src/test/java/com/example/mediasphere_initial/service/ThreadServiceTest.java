package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.config.TestConfig;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.ThreadLike;
import com.example.mediasphere_initial.model.ThreadDislike;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.CommentRepository;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ThreadLikeRepository;
import com.example.mediasphere_initial.repository.ThreadDislikeRepository;
import com.example.mediasphere_initial.repository.CommentLikeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ThreadService
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
class ThreadServiceTest {

    @Mock
    private ThreadRepository threadRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ThreadLikeRepository threadLikeRepository;

    @Mock
    private ThreadDislikeRepository threadDislikeRepository;

    @Mock
    private CommentLikeRepository commentLikeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ThreadService threadService;

    private Thread testThread;
    private User testUser;
    private Comment testComment;
    private UUID testThreadId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testThreadId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setCreatedAt(LocalDateTime.now());

        testThread = new Thread();
        testThread.setId(testThreadId);
        testThread.setTitle("Test Thread");
        testThread.setContent("Test content");
        testThread.setCreatedBy(testUser);
        testThread.setCreatedAt(LocalDateTime.now());

        testComment = new Comment();
        testComment.setId(UUID.randomUUID());
        testComment.setContent("Test comment");
        testComment.setThread(testThread);
        testComment.setCreatedBy(testUser);
        testComment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getAllThreads_Success() {
        // Given
        List<Thread> threads = Arrays.asList(testThread, new Thread());
        when(threadRepository.findAll()).thenReturn(threads);

        // When
        List<Thread> result = threadService.getAllThreads();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testThread);

        verify(threadRepository).findAll();
    }

    @Test
    void getThreadById_ThreadExists_ReturnsThread() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));

        // When
        Optional<Thread> result = threadService.getThreadById(testThreadId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(testThreadId);
        assertThat(result.get().getTitle()).isEqualTo("Test Thread");

        verify(threadRepository).findById(testThreadId);
    }

    @Test
    void getThreadById_ThreadDoesNotExist_ReturnsEmpty() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.empty());

        // When
        Optional<Thread> result = threadService.getThreadById(testThreadId);

        // Then
        assertThat(result).isEmpty();

        verify(threadRepository).findById(testThreadId);
    }

    @Test
    void updateThread_Success() {
        // Given
        Thread updatedThread = new Thread();
        updatedThread.setTitle("Updated Title");
        updatedThread.setContent("Updated content");

        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        when(threadRepository.save(any(Thread.class))).thenReturn(testThread);

        // When
        Thread result = threadService.updateThread(testThreadId, updatedThread, testUser);

        // Then
        assertThat(result).isNotNull();

        verify(threadRepository).findById(testThreadId);
        verify(threadRepository).save(any(Thread.class));
    }

    @Test
    void deleteThread_ThreadExists_ReturnsTrue() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        testThread.setCreatedBy(testUser);

        // When
        boolean result = threadService.deleteThread(testThreadId, testUser);

        // Then
        assertThat(result).isTrue();

        verify(threadRepository).findById(testThreadId);
        verify(threadRepository).delete(testThread);
    }

    @Test
    void deleteThread_ThreadDoesNotExist_ThrowsException() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> threadService.deleteThread(testThreadId, testUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Thread not found");

        verify(threadRepository).findById(testThreadId);
        verify(threadRepository, never()).delete(any(Thread.class));
    }

    @Test
    void getThreadComments_Success() {
        // Given
        List<Comment> comments = Arrays.asList(testComment, new Comment());
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        when(commentRepository.findByThread(testThread)).thenReturn(comments);

        // When
        List<Comment> result = threadService.getThreadComments(testThreadId);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testComment);

        verify(threadRepository).findById(testThreadId);
        verify(commentRepository).findByThread(testThread);
    }

    @Test
    void addComment_Success() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        // When
        Comment result = threadService.addComment(testThreadId, testComment, testUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Test comment");

        verify(threadRepository).findById(testThreadId);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void likeThread_Success() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        when(threadLikeRepository.findByThreadAndUser(testThread, testUser)).thenReturn(Optional.empty());
        when(threadDislikeRepository.findByThreadAndUser(testThread, testUser)).thenReturn(Optional.empty());
        when(threadLikeRepository.save(any(ThreadLike.class))).thenReturn(new ThreadLike());

        // When
        Map<String, Object> result = threadService.likeThread(testThreadId, testUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).containsKey("liked");
        assertThat(result).containsKey("likeCount");

        verify(threadRepository).findById(testThreadId);
        verify(threadLikeRepository).findByThreadAndUser(testThread, testUser);
        verify(threadDislikeRepository).findByThreadAndUser(testThread, testUser);
    }

    @Test
    void dislikeThread_Success() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        when(threadDislikeRepository.findByThreadAndUser(testThread, testUser)).thenReturn(Optional.empty());
        when(threadLikeRepository.findByThreadAndUser(testThread, testUser)).thenReturn(Optional.empty());
        when(threadDislikeRepository.save(any(ThreadDislike.class))).thenReturn(new ThreadDislike());

        // When
        Map<String, Object> result = threadService.dislikeThread(testThreadId, testUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).containsKey("disliked");
        assertThat(result).containsKey("dislikeCount");

        verify(threadRepository).findById(testThreadId);
        verify(threadDislikeRepository).findByThreadAndUser(testThread, testUser);
        verify(threadLikeRepository).findByThreadAndUser(testThread, testUser);
    }

    @Test
    void getThreadStats_Success() {
        // Given
        when(threadRepository.findById(testThreadId)).thenReturn(Optional.of(testThread));
        testThread.setCommentCount(10);

        // When
        Map<String, Object> result = threadService.getThreadStats(testThreadId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).containsKey("id");
        assertThat(result).containsKey("title");
        assertThat(result).containsKey("viewCount");
        assertThat(result).containsKey("commentCount");
        assertThat(result).containsKey("createdAt");
        assertThat(result).containsKey("isPinned");
        assertThat(result).containsKey("isLocked");

        verify(threadRepository).findById(testThreadId);
    }
}
