// Package declaration (adjust if your package is different)
package com.example.mediasphere_initial.model;

// Import statements for JPA and other Java types
import jakarta.persistence.Entity;             // Marks this class as a JPA entity
import jakarta.persistence.Id;                // Marks the primary key field
import jakarta.persistence.Column;            // Customizes column mappings
import jakarta.persistence.Table;             // Maps to a specific table name
import java.time.LocalDateTime;              // For created_at and updated_at timestamps
import java.util.UUID;                       // For UUID type IDs

// Map this class to the "users" table in the database
@Entity
@Table(name = "users")


public class User {

    // Primary key, using UUID
    @Id
    @Column(columnDefinition = "UUID") // Tells JPA to use the UUID type
    private UUID id;

    // Unique and not null email column
    @Column(unique = true, nullable = false)
    private String email;

    // Nullable password hash column (for OAuth users)
    @Column(name = "password_hash")
    private String passwordHash;

    // Not null username column
    @Column(nullable = false)
    private String username;

    // Not null role column
    @Column(nullable = false)
    private String role;

    // Nullable profile_pic column
    @Column(name = "profile_pic")
    private String profilePic;

    // OAuth and Clerk integration fields
    @Column(name = "clerk_user_id")
    private String clerkUserId;

    @Column(name = "oauth_provider")
    private String oauthProvider; // "local", "google", "facebook", "clerk"

    @Column(name = "oauth_provider_id")
    private String oauthProviderId;

    @Column(name = "is_email_verified", nullable = false)
    private Boolean isEmailVerified = false;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "oauth_profile_picture")
    private String oauthProfilePicture;

    @Column(name = "last_oauth_sync")
    private LocalDateTime lastOauthSync;

    @Column(name = "primary_auth_method")
    private String primaryAuthMethod;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_method")
    private String lastLoginMethod;

    @Column(name = "account_created_via")
    private String accountCreatedVia;

    // Not null created_at column
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Nullable updated_at column
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor required by JPA
    public User() {}

    // Getters and setters for all fields

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Getters and setters for new OAuth fields
    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getOauthProvider() { return oauthProvider; }
    public void setOauthProvider(String oauthProvider) { this.oauthProvider = oauthProvider; }

    public String getOauthProviderId() { return oauthProviderId; }
    public void setOauthProviderId(String oauthProviderId) { this.oauthProviderId = oauthProviderId; }

    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getOauthProfilePicture() { return oauthProfilePicture; }
    public void setOauthProfilePicture(String oauthProfilePicture) { this.oauthProfilePicture = oauthProfilePicture; }

    public LocalDateTime getLastOauthSync() { return lastOauthSync; }
    public void setLastOauthSync(LocalDateTime lastOauthSync) { this.lastOauthSync = lastOauthSync; }

    public String getPrimaryAuthMethod() { return primaryAuthMethod; }
    public void setPrimaryAuthMethod(String primaryAuthMethod) { this.primaryAuthMethod = primaryAuthMethod; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getLastLoginMethod() { return lastLoginMethod; }
    public void setLastLoginMethod(String lastLoginMethod) { this.lastLoginMethod = lastLoginMethod; }

    public String getAccountCreatedVia() { return accountCreatedVia; }
    public void setAccountCreatedVia(String accountCreatedVia) { this.accountCreatedVia = accountCreatedVia; }
}