package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication controller for Clerk-based authentication.
 * All authentication flows go through Clerk, no local auth supported.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from frontend
public class AuthController {

    @Autowired
    private AuthService authService;



    /**
     * Get current authenticated user from JWT token.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            }
        }
        return ResponseEntity.status(401).build();
    }

    /**
     * Primary authentication endpoint for Clerk users.
     * Creates new user or authenticates existing user.
     */
    @PostMapping("/oauth/clerk")
    public ResponseEntity<?> authenticateWithClerk(@RequestBody ClerkUserDto clerkUser) {
        try {
            AuthResponse response = authService.authenticateOrCreateClerkUser(clerkUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    /**
     * Sync user profile with latest Clerk data.
     * Requires valid JWT token.
     */
    @PostMapping("/oauth/sync")
    public ResponseEntity<?> syncClerkProfile(@RequestBody ClerkUserDto clerkUser, 
                                             @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Optional<User> userOpt = authService.getUserFromToken(token);
                if (userOpt.isPresent()) {
                    AuthResponse response = authService.authenticateOrCreateClerkUser(clerkUser);
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid token"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }
}

class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}