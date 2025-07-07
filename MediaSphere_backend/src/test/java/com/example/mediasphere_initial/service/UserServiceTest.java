package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.config.TestConfig;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
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
 * Unit tests for UserService
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserClubRepository userClubRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Club testClub;
    private UserClub testUserClub;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedpassword");
        testUser.setRole("user");
        testUser.setCreatedAt(LocalDateTime.now());

        testClub = new Club();
        testClub.setId(UUID.randomUUID());
        testClub.setName("Test Club");
        testClub.setDescription("Test Description");
        testClub.setCreatedBy(testUser);
        testClub.setCreatedAt(LocalDateTime.now());

        testUserClub = new UserClub();
        testUserClub.setUser(testUser);
        testUserClub.setClub(testClub);
        testUserClub.setJoinedAt(LocalDateTime.now());
    }

    @Test
    void saveUser_Success() {
        // Given
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = userService.saveUser(testUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");

        verify(userRepository).save(testUser);
    }

    @Test
    void getAllUsers_Success() {
        // Given
        List<User> users = Arrays.asList(testUser, new User());
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<User> result = userService.getAllUsers();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testUser);

        verify(userRepository).findAll();
    }

    @Test
    void getUserById_UserExists_ReturnsUser() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.getUserById(testUserId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(testUserId);

        verify(userRepository).findById(testUserId);
    }

    @Test
    void getUserById_UserDoesNotExist_ReturnsEmpty() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.getUserById(testUserId);

        // Then
        assertThat(result).isEmpty();

        verify(userRepository).findById(testUserId);
    }

    @Test
    void deleteUser_UserExists_ReturnsTrue() {
        // Given
        when(userRepository.existsById(testUserId)).thenReturn(true);

        // When
        boolean result = userService.deleteUser(testUserId);

        // Then
        assertThat(result).isTrue();

        verify(userRepository).existsById(testUserId);
        verify(userRepository).deleteById(testUserId);
    }

    @Test
    void deleteUser_UserDoesNotExist_ReturnsFalse() {
        // Given
        when(userRepository.existsById(testUserId)).thenReturn(false);

        // When
        boolean result = userService.deleteUser(testUserId);

        // Then
        assertThat(result).isFalse();

        verify(userRepository).existsById(testUserId);
        verify(userRepository, never()).deleteById(testUserId);
    }

    @Test
    void getUserByEmail_UserExists_ReturnsUser() {
        // Given
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.getUserByEmail(email);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);

        verify(userRepository).findByEmail(email);
    }

    @Test
    void getUserByEmail_UserDoesNotExist_ReturnsEmpty() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.getUserByEmail(email);

        // Then
        assertThat(result).isEmpty();

        verify(userRepository).findByEmail(email);
    }

    @Test
    void getUserClubs_UserExists_ReturnsClubs() {
        // Given
        List<UserClub> memberships = Arrays.asList(testUserClub);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userClubRepository.findByUser(testUser)).thenReturn(memberships);

        // When
        List<Club> result = userService.getUserClubs(testUserId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testClub);

        verify(userRepository).findById(testUserId);
        verify(userClubRepository).findByUser(testUser);
    }

    @Test
    void getUserClubs_UserDoesNotExist_ThrowsException() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.getUserClubs(testUserId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userRepository).findById(testUserId);
        verify(userClubRepository, never()).findByUser(any());
    }
}
