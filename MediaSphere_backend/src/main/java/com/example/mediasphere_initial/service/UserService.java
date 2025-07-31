// Package declaration
package com.example.mediasphere_initial.service;

// Import the User entity and repository
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;

import org.springframework.beans.factory.annotation.Autowired; // For injecting dependencies
import org.springframework.stereotype.Service;             // Marks this class as a service

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

// This annotation tells Spring to treat this as a service component (singleton, reusable)
@Service
public class UserService {

    // Injects the UserRepository so we can access DB methods
    //repository er moddhe joto method ache(and our custom ones), segulo UserService e use korte parbo
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserClubRepository userClubRepository;

    // Create or update a user in the database
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Retrieve all users from the database
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Find a user by their UUID
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    // Delete a user by their UUID
    public boolean deleteUser(UUID id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Find a user by email (custom query)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Safe user creation that handles duplicate email constraints
    public User createUserSafely(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception ex) {
            // Check if it's a duplicate email constraint violation
            if (ex.getMessage() != null && ex.getMessage().contains("users_email_key")) {
                throw new RuntimeException("User with email " + user.getEmail() + " already exists");
            }
            throw new RuntimeException("Failed to create user: " + ex.getMessage());
        }
    }

    // Update user with duplicate email handling
    public User updateUserSafely(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("users_email_key")) {
                throw new RuntimeException("Cannot update user: email " + user.getEmail() + " is already in use");
            }
            throw new RuntimeException("Failed to update user: " + ex.getMessage());
        }
    }

    // Get clubs the user is member of
    public List<Club> getUserClubs(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<UserClub> memberships = userClubRepository.findByUser(user);
        return memberships.stream()
            .map(UserClub::getClub)
            .collect(Collectors.toList());
    }


}
//here each function is like a task
// inside each one, we call the repository methods to perform the actual database operations