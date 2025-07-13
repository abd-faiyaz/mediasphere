
package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication service for Clerk-based authentication.
 * This service handles user authentication and profile management using Clerk as the primary auth provider.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Authenticate or create user from Clerk authentication.
     * This is the primary authentication method for the application.
     */
    public AuthResponse authenticateOrCreateClerkUser(ClerkUserDto clerkUser) {
        // Validate required fields
        if (clerkUser.getClerkUserId() == null || clerkUser.getClerkUserId().trim().isEmpty()) {
            throw new RuntimeException("Clerk user ID is required");
        }
        if (clerkUser.getEmail() == null || clerkUser.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        // Check if user exists by Clerk ID
        Optional<User> existingUser = userRepository.findByClerkUserId(clerkUser.getClerkUserId());
        
        if (existingUser.isPresent()) {
            // Update existing user profile and login
            User user = existingUser.get();
            updateUserFromClerk(user, clerkUser);
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginMethod("clerk");
            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return new AuthResponse(token, savedUser);
        }
        
        // Create new user if not found
        User newUser = createClerkUser(clerkUser);
        User savedUser = userRepository.save(newUser);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser);
    }
    
    /**
     * Create a new user from Clerk authentication data.
     */
    private User createClerkUser(ClerkUserDto clerkUser) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setClerkUserId(clerkUser.getClerkUserId());
        user.setEmail(clerkUser.getEmail());
        user.setUsername(clerkUser.getUsername() != null ? clerkUser.getUsername() : generateUsernameFromEmail(clerkUser.getEmail()));
        user.setFirstName(clerkUser.getFirstName());
        user.setLastName(clerkUser.getLastName());
        user.setOauthProvider("clerk");
        user.setOauthProviderId(clerkUser.getClerkUserId());
        user.setPrimaryAuthMethod("clerk");
        user.setAccountCreatedVia("clerk_" + clerkUser.getAuthProvider());
        user.setIsEmailVerified(clerkUser.getEmailVerified() != null ? clerkUser.getEmailVerified() : false);
        user.setOauthProfilePicture(clerkUser.getProfileImageUrl());
        user.setRole("user");
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginMethod("clerk");
        user.setLastOauthSync(LocalDateTime.now());
        return user;
    }
    
    /**
     * Update existing user profile with latest data from Clerk.
     */
    private void updateUserFromClerk(User user, ClerkUserDto clerkUser) {
        if (clerkUser.getFirstName() != null) user.setFirstName(clerkUser.getFirstName());
        if (clerkUser.getLastName() != null) user.setLastName(clerkUser.getLastName());
        if (clerkUser.getProfileImageUrl() != null) user.setOauthProfilePicture(clerkUser.getProfileImageUrl());
        if (clerkUser.getEmailVerified() != null) user.setIsEmailVerified(clerkUser.getEmailVerified());
        user.setLastOauthSync(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }
    
    /**
     * Generate a unique username from email address.
     */
    private String generateUsernameFromEmail(String email) {
        return email.split("@")[0] + "_" + System.currentTimeMillis();
    }

    /**
     * Get user from JWT token if valid.
     * Returns empty Optional if token is invalid or user not found.
     */
    public Optional<User> getUserFromToken(String token) {
        try {
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractEmail(token);
                return userRepository.findByEmail(email);
            }
        } catch (Exception e) {
            // Log the error if needed, but return empty Optional for security
        }
        return Optional.empty();
    }
}