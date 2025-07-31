
package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public AuthResponse authenticateOrCreateClerkUser(ClerkUserDto clerkUser) {
        // Validate required fields
        if (clerkUser.getClerkUserId() == null || clerkUser.getClerkUserId().trim().isEmpty()) {
            throw new RuntimeException("Clerk user ID is required");
        }
        if (clerkUser.getEmail() == null || clerkUser.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        try {
            // First check if user exists by Clerk ID
            Optional<User> existingUserByClerk = userRepository.findByClerkUserId(clerkUser.getClerkUserId());
            
            if (existingUserByClerk.isPresent()) {
                // Update existing user profile and login
                User user = existingUserByClerk.get();
                updateUserFromClerk(user, clerkUser);
                user.setLastLoginAt(LocalDateTime.now());
                user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
                User savedUser = userRepository.save(user);
                String token = jwtUtil.generateToken(savedUser.getEmail());
                return new AuthResponse(token, savedUser);
            }
            
            // Check if user exists by email (account linking scenario)
            Optional<User> existingUserByEmail = userRepository.findByEmail(clerkUser.getEmail());
            if (existingUserByEmail.isPresent()) {
                // Link accounts - update existing user with Clerk data
                User user = existingUserByEmail.get();
                user.setClerkUserId(clerkUser.getClerkUserId());
                if ("local".equals(user.getOauthProvider())) {
                    user.setPrimaryAuthMethod("hybrid"); // Both local and oauth
                } else {
                    user.setPrimaryAuthMethod("oauth");
                }
                user.setOauthProvider("clerk");
                user.setOauthProviderId(clerkUser.getClerkUserId());
                updateUserFromClerk(user, clerkUser);
                user.setLastLoginAt(LocalDateTime.now());
                user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
                User savedUser = userRepository.save(user);
                String token = jwtUtil.generateToken(savedUser.getEmail());
                return new AuthResponse(token, savedUser);
            }
            
            // Create new user if not found
            User newUser = createClerkUser(clerkUser);
            User savedUser = userRepository.save(newUser);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return new AuthResponse(token, savedUser);
            
        } catch (DataIntegrityViolationException ex) {
            // Handle duplicate key constraint violation
            if (ex.getMessage() != null && ex.getMessage().contains("users_email_key")) {
                // Try to find and link the existing user account
                Optional<User> existingUser = userRepository.findByEmail(clerkUser.getEmail());
                if (existingUser.isPresent()) {
                    User user = existingUser.get();
                    user.setClerkUserId(clerkUser.getClerkUserId());
                    user.setOauthProvider("clerk");
                    user.setOauthProviderId(clerkUser.getClerkUserId());
                    if ("local".equals(user.getPrimaryAuthMethod())) {
                        user.setPrimaryAuthMethod("hybrid");
                    } else {
                        user.setPrimaryAuthMethod("oauth");
                    }
                    updateUserFromClerk(user, clerkUser);
                    user.setLastLoginAt(LocalDateTime.now());
                    user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
                    User savedUser = userRepository.save(user);
                    String token = jwtUtil.generateToken(savedUser.getEmail());
                    return new AuthResponse(token, savedUser);
                } else {
                    throw new RuntimeException("Account already exists with this email but could not be linked");
                }
            } else {
                throw new RuntimeException("Database error during user creation: " + ex.getMessage());
            }
        }
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
        // Update profile information if provided
        if (clerkUser.getFirstName() != null && !clerkUser.getFirstName().trim().isEmpty()) {
            user.setFirstName(clerkUser.getFirstName());
        }
        if (clerkUser.getLastName() != null && !clerkUser.getLastName().trim().isEmpty()) {
            user.setLastName(clerkUser.getLastName());
        }
        if (clerkUser.getProfileImageUrl() != null && !clerkUser.getProfileImageUrl().trim().isEmpty()) {
            user.setOauthProfilePicture(clerkUser.getProfileImageUrl());
        }
        if (clerkUser.getEmailVerified() != null) {
            user.setIsEmailVerified(clerkUser.getEmailVerified());
        }
        
        // Update username if not set or if it's auto-generated
        if (clerkUser.getUsername() != null && !clerkUser.getUsername().trim().isEmpty()) {
            if (user.getUsername() == null || user.getUsername().contains("_" + user.getCreatedAt().toEpochSecond(java.time.ZoneOffset.UTC))) {
                user.setUsername(clerkUser.getUsername());
            }
        }
        
        // Update sync timestamps
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