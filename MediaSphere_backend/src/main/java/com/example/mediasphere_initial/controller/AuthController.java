package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.dto.LoginRequest;
import com.example.mediasphere_initial.dto.RegisterRequest;
import com.example.mediasphere_initial.dto.AuthResponse;
import com.example.mediasphere_initial.dto.ClerkUserDto;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from frontend
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

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

    // OAuth authentication endpoints
    @PostMapping("/oauth/clerk")
    public ResponseEntity<?> authenticateWithClerk(@RequestBody ClerkUserDto clerkUser) {
        try {
            AuthResponse response = authService.authenticateOrCreateOAuthUser(clerkUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PostMapping("/oauth/sync")
    public ResponseEntity<?> syncOAuthProfile(@RequestBody ClerkUserDto clerkUser, 
                                             @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Optional<User> userOpt = authService.getUserFromToken(token);
                if (userOpt.isPresent()) {
                    AuthResponse response = authService.authenticateOrCreateOAuthUser(clerkUser);
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