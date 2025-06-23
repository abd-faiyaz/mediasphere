// Package declaration (adjust if your package is different)
package com.example.mediasphere_initial.repository;

// Import the User entity and JpaRepository interface
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

// This interface will be a Spring Data repository for the User entity
public interface UserRepository extends JpaRepository<User, UUID> {

    // Custom query method: find a user by email (returns Optional<User>)
    Optional<User> findByEmail(String email);
    
    // OAuth-related query methods
    Optional<User> findByClerkUserId(String clerkUserId);
    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);
    boolean existsByClerkUserId(String clerkUserId);
    boolean existsByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);
    
    //spring data will automatically implement this method
}

//pattern hocche:
//custom query method: findBy + field name format ee boshabo(as needed)