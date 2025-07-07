package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.config.TestConfig;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.MediaType;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
import com.example.mediasphere_initial.repository.UserRepository;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ClubService
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
class ClubServiceTest {

    @Mock
    private ClubRepository clubRepository;

    @Mock
    private UserClubRepository userClubRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private ImageUploadService imageUploadService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClubService clubService;

    private Club testClub;
    private User testUser;
    private UserClub testUserClub;
    private UUID testClubId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testClubId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole("user");
        testUser.setCreatedAt(LocalDateTime.now());

        testClub = new Club();
        testClub.setId(testClubId);
        testClub.setName("Test Club");
        testClub.setDescription("Test Description");

        // Create MediaType object
        MediaType movieType = new MediaType();
        movieType.setId(UUID.randomUUID());
        movieType.setName("movie");
        movieType.setDescription("Movie media type");
        testClub.setMediaType(movieType);

        testClub.setCreatedBy(testUser);
        testClub.setCreatedAt(LocalDateTime.now());

        testUserClub = new UserClub();
        testUserClub.setUser(testUser);
        testUserClub.setClub(testClub);
        testUserClub.setJoinedAt(LocalDateTime.now());
    }

    @Test
    void getAllClubs_Success() {
        // Given
        List<Club> clubs = Arrays.asList(testClub, new Club());
        when(clubRepository.findAll()).thenReturn(clubs);

        // When
        List<Club> result = clubService.getAllClubs();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testClub);

        verify(clubRepository).findAll();
    }

    @Test
    void getClubById_ClubExists_ReturnsClub() {
        // Given
        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));

        // When
        Optional<Club> result = clubService.getClubById(testClubId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(testClubId);
        assertThat(result.get().getName()).isEqualTo("Test Club");

        verify(clubRepository).findById(testClubId);
    }

    @Test
    void getClubById_ClubDoesNotExist_ReturnsEmpty() {
        // Given
        when(clubRepository.findById(testClubId)).thenReturn(Optional.empty());

        // When
        Optional<Club> result = clubService.getClubById(testClubId);

        // Then
        assertThat(result).isEmpty();

        verify(clubRepository).findById(testClubId);
    }

    @Test
    void createClub_Success() {
        // Given
        Club newClub = new Club();
        newClub.setName("New Club");
        newClub.setDescription("New Description");

        // Create MediaType object
        MediaType bookType = new MediaType();
        bookType.setId(UUID.randomUUID());
        bookType.setName("book");
        bookType.setDescription("Book media type");
        newClub.setMediaType(bookType);

        when(clubRepository.save(any(Club.class))).thenReturn(testClub);
        when(userClubRepository.existsByUserAndClub(testUser, testClub)).thenReturn(false);
        when(userClubRepository.save(any(UserClub.class))).thenReturn(testUserClub);

        // When
        Club result = clubService.createClub(newClub, testUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCreatedBy()).isEqualTo(testUser);

        verify(clubRepository).save(any(Club.class));
        verify(userClubRepository).existsByUserAndClub(eq(testUser), any(Club.class));
        verify(userClubRepository).save(any(UserClub.class));
    }

    @Test
    void updateClub_CreatorUpdatesClub_Success() {
        // Given
        Club updatedClub = new Club();
        updatedClub.setName("Updated Club");
        updatedClub.setDescription("Updated Description");

        // Create MediaType object
        MediaType gameType = new MediaType();
        gameType.setId(UUID.randomUUID());
        gameType.setName("game");
        gameType.setDescription("Game media type");
        updatedClub.setMediaType(gameType);

        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));
        when(clubRepository.save(any(Club.class))).thenReturn(testClub);

        // When
        Club result = clubService.updateClub(testClubId, updatedClub, testUser);

        // Then
        assertThat(result).isNotNull();

        verify(clubRepository).findById(testClubId);
        verify(clubRepository).save(any(Club.class));
    }

    @Test
    void updateClub_NonCreatorUpdatesClub_ThrowsException() {
        // Given
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setRole("user");

        Club updatedClub = new Club();
        updatedClub.setName("Updated Club");

        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));

        // When & Then
        assertThatThrownBy(() -> clubService.updateClub(testClubId, updatedClub, otherUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unauthorized to update club");

        verify(clubRepository).findById(testClubId);
        verify(clubRepository, never()).save(any(Club.class));
    }

    @Test
    void updateClub_ClubDoesNotExist_ThrowsException() {
        // Given
        Club updatedClub = new Club();
        updatedClub.setName("Updated Club");

        when(clubRepository.findById(testClubId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> clubService.updateClub(testClubId, updatedClub, testUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Club not found");

        verify(clubRepository).findById(testClubId);
        verify(clubRepository, never()).save(any(Club.class));
    }

    @Test
    void deleteClub_CreatorDeletesClub_ReturnsTrue() {
        // Given
        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));

        // When
        boolean result = clubService.deleteClub(testClubId, testUser);

        // Then
        assertThat(result).isTrue();

        verify(clubRepository).findById(testClubId);
        verify(clubRepository).delete(testClub);
    }

    @Test
    void deleteClub_NonCreatorDeletesClub_ReturnsFalse() {
        // Given
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setRole("user");

        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));

        // When
        boolean result = clubService.deleteClub(testClubId, otherUser);

        // Then
        assertThat(result).isFalse();

        verify(clubRepository).findById(testClubId);
        verify(clubRepository, never()).delete(any(Club.class));
    }

    @Test
    void deleteClub_AdminDeletesClub_ReturnsTrue() {
        // Given
        User adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setRole("admin");

        when(clubRepository.findById(testClubId)).thenReturn(Optional.of(testClub));

        // When
        boolean result = clubService.deleteClub(testClubId, adminUser);

        // Then
        assertThat(result).isTrue();

        verify(clubRepository).findById(testClubId);
        verify(clubRepository).delete(testClub);
    }

    @Test
    void deleteClub_ClubDoesNotExist_ThrowsException() {
        // Given
        when(clubRepository.findById(testClubId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> clubService.deleteClub(testClubId, testUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Club not found");

        verify(clubRepository).findById(testClubId);
        verify(clubRepository, never()).delete(any(Club.class));
    }
}
