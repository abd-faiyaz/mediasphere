package com.example.mediasphere_initial.dto;

public class ClerkUserDto {
    private String clerkUserId;
    private String email;
    private String firstName;
    private String lastName;
    private String username;
    private String profileImageUrl;
    private Boolean emailVerified;
    private String authProvider; // "google", "facebook", etc.

    // Constructors
    public ClerkUserDto() {}

    public ClerkUserDto(String clerkUserId, String email, String firstName, String lastName, 
                       String username, String profileImageUrl, Boolean emailVerified, String authProvider) {
        this.clerkUserId = clerkUserId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.profileImageUrl = profileImageUrl;
        this.emailVerified = emailVerified;
        this.authProvider = authProvider;
    }

    // Getters and setters
    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
}
