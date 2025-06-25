// Package declaration for controller classes
package com.example.mediasphere_initial.controller;

// Import necessary classes and annotations
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Annotation to mark this class as a REST controller
@RestController
// Base path for all endpoints in this controller
@RequestMapping("/users")
public class UserController {

    // Inject the UserService to access user operations
    @Autowired
    private UserService userService;

    // Get user profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable("id") UUID id) {
        // Call the service to get the user by ID
        Optional<User> user = userService.getUserById(id);
        // If user is present, return 200 OK, else return 404 Not Found
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update user profile by ID
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable("id") UUID id,
            @RequestBody User updatedUser) {
        // Call the service to get the existing user
        Optional<User> existingUserOpt = userService.getUserById(id);

        // If user doesn't exist, return 404 Not Found
        if (!existingUserOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = existingUserOpt.get();

        // Update fields (add more as needed)
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setProfilePic(updatedUser.getProfilePic());
        existingUser.setRole(updatedUser.getRole());
        existingUser.setEmail(updatedUser.getEmail());

        // Save updated user
        User savedUser = userService.saveUser(existingUser);

        // Return the updated user with 200 OK
        return ResponseEntity.ok(savedUser);
    }

    // Get a list of clubs the user is part of
    @GetMapping("/{id}/clubs")
    public ResponseEntity<?> getUserClubs(@PathVariable("id") UUID id) {
        try {
            List<Club> userClubs = userService.getUserClubs(id);
            return ResponseEntity.ok(userClubs);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        user.setId(UUID.randomUUID());
        user.setCreatedAt(LocalDateTime.now());
        User createdUser = userService.saveUser(user);
        return ResponseEntity.status(201).body(createdUser);
    }

    // Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") UUID id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}