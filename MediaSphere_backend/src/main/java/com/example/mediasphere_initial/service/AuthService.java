
package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.dto.LoginRequest;
import com.example.mediasphere_initial.dto.RegisterRequest;
import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        user.setOauthProvider("local");
        user.setPrimaryAuthMethod("local");
        user.setAccountCreatedVia("local");
        user.setIsEmailVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginMethod("local");
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // Check if user is local auth user
        if (!"local".equals(user.getOauthProvider()) && user.getPasswordHash() == null) {
            throw new RuntimeException("Please use OAuth sign-in for this account");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Update login tracking
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginMethod("local");
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user);
    }

    // OAuth authentication methods
    public AuthResponse authenticateOrCreateOAuthUser(ClerkUserDto clerkUser) {
        // First check if user exists by Clerk ID
        Optional<User> existingUser = userRepository.findByClerkUserId(clerkUser.getClerkUserId());
        
        if (existingUser.isPresent()) {
            // Update existing user and login
            User user = existingUser.get();
            updateUserFromClerk(user, clerkUser);
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return new AuthResponse(token, savedUser);
        }
        
        // Check if user exists by email (account linking scenario)
        Optional<User> emailUser = userRepository.findByEmail(clerkUser.getEmail());
        if (emailUser.isPresent()) {
            // Link accounts
            User user = emailUser.get();
            user.setClerkUserId(clerkUser.getClerkUserId());
            if ("local".equals(user.getOauthProvider())) {
                user.setPrimaryAuthMethod("hybrid");
            }
            updateUserFromClerk(user, clerkUser);
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return new AuthResponse(token, savedUser);
        }
        
        // Create new OAuth user
        User newUser = createOAuthUser(clerkUser);
        User savedUser = userRepository.save(newUser);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser);
    }
    
    private User createOAuthUser(ClerkUserDto clerkUser) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setClerkUserId(clerkUser.getClerkUserId());
        user.setEmail(clerkUser.getEmail());
        user.setUsername(clerkUser.getUsername() != null ? clerkUser.getUsername() : generateUsernameFromEmail(clerkUser.getEmail()));
        user.setFirstName(clerkUser.getFirstName());
        user.setLastName(clerkUser.getLastName());
        user.setOauthProvider("clerk");
        user.setOauthProviderId(clerkUser.getClerkUserId());
        user.setPrimaryAuthMethod("oauth");
        user.setAccountCreatedVia("clerk_" + clerkUser.getAuthProvider());
        user.setIsEmailVerified(clerkUser.getEmailVerified() != null ? clerkUser.getEmailVerified() : false);
        user.setOauthProfilePicture(clerkUser.getProfileImageUrl());
        user.setRole("user");
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginMethod("clerk_" + clerkUser.getAuthProvider());
        user.setLastOauthSync(LocalDateTime.now());
        return user;
    }
    
    private void updateUserFromClerk(User user, ClerkUserDto clerkUser) {
        if (clerkUser.getFirstName() != null) user.setFirstName(clerkUser.getFirstName());
        if (clerkUser.getLastName() != null) user.setLastName(clerkUser.getLastName());
        if (clerkUser.getProfileImageUrl() != null) user.setOauthProfilePicture(clerkUser.getProfileImageUrl());
        if (clerkUser.getEmailVerified() != null) user.setIsEmailVerified(clerkUser.getEmailVerified());
        user.setLastOauthSync(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }
    
    private String generateUsernameFromEmail(String email) {
        return email.split("@")[0] + "_" + System.currentTimeMillis();
    }

    public Optional<User> getUserFromToken(String token) {
        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email);
        }
        return Optional.empty();
    }
}