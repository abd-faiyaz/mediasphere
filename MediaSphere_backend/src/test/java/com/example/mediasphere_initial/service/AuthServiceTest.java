package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.config.TestConfig;
import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.LoginRequest;
import com.example.mediasphere_initial.dto.RegisterRequest;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Setup test data
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedpassword");
        testUser.setRole("user");
        testUser.setOauthProvider("local");
        testUser.setPrimaryAuthMethod("local");
        testUser.setCreatedAt(LocalDateTime.now());

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void register_Success() {
        // Given
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser.getEmail())).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(userRepository).findByEmail(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(testUser.getEmail());
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.of(testUser));

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");

        verify(userRepository).findByEmail(registerRequest.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Given
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser.getEmail())).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(testUser.getEmail());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        // Given
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        // Given
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_OAuthUserWithoutPassword_ThrowsException() {
        // Given
        testUser.setOauthProvider("google");
        testUser.setPasswordHash(null);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Please use OAuth sign-in for this account");

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void getUserFromToken_ValidToken_ReturnsUser() {
        // Given
        String token = "valid-jwt-token";
        when(jwtUtil.isTokenValid(token)).thenReturn(true);
        when(jwtUtil.extractEmail(token)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = authService.getUserFromToken(token);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("test@example.com");

        verify(jwtUtil).isTokenValid(token);
        verify(jwtUtil).extractEmail(token);
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void getUserFromToken_InvalidToken_ReturnsEmpty() {
        // Given
        String token = "invalid-jwt-token";
        when(jwtUtil.isTokenValid(token)).thenReturn(false);

        // When
        Optional<User> result = authService.getUserFromToken(token);

        // Then
        assertThat(result).isEmpty();

        verify(jwtUtil).isTokenValid(token);
        verify(jwtUtil, never()).extractEmail(anyString());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void authenticateOrCreateOAuthUser_NewUser_CreatesUser() {
        // Given
        ClerkUserDto clerkUser = new ClerkUserDto();
        clerkUser.setClerkUserId("clerk_123");
        clerkUser.setEmail("newuser@example.com");
        clerkUser.setUsername("newuser");
        clerkUser.setFirstName("John");
        clerkUser.setLastName("Doe");
        clerkUser.setAuthProvider("google");
        clerkUser.setEmailVerified(true);

        when(userRepository.findByClerkUserId("clerk_123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(UUID.randomUUID());
            return savedUser;
        });
        when(jwtUtil.generateToken("newuser@example.com")).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.authenticateOrCreateOAuthUser(clerkUser);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("newuser@example.com");
        assertThat(response.getUser().getClerkUserId()).isEqualTo("clerk_123");

        verify(userRepository).findByClerkUserId("clerk_123");
        verify(userRepository).findByEmail("newuser@example.com");
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken("newuser@example.com");
    }
}
