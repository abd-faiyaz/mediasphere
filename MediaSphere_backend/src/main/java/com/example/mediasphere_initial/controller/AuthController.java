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
            // Log the error for debugging
            System.err.println("Authentication error: " + ex.getMessage());
            ex.printStackTrace();
            
            // Return appropriate error response
            String errorMessage = ex.getMessage();
            if (errorMessage.contains("already exists") || errorMessage.contains("duplicate")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Account with this email already exists. Please try signing in instead."));
            } else if (errorMessage.contains("required")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(errorMessage));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Authentication failed. Please try again."));
            }
        } catch (Exception ex) {
            System.err.println("Unexpected authentication error: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Authentication failed. Please try again."));
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
                .body(new ErrorResponse("Invalid or missing authentication token"));
        } catch (RuntimeException ex) {
            System.err.println("Profile sync error: " + ex.getMessage());
            ex.printStackTrace();
            
            String errorMessage = ex.getMessage();
            if (errorMessage.contains("already exists") || errorMessage.contains("duplicate")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Account linking failed. Please contact support."));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Profile sync failed: " + errorMessage));
            }
        } catch (Exception ex) {
            System.err.println("Unexpected sync error: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Profile sync failed. Please try again."));
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