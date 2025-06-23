package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

// Import statements for JPA and other Java types
import jakarta.persistence.Entity;             // Marks this class as a JPA entity
import jakarta.persistence.Id;                // Marks the primary key field
import jakarta.persistence.Column;            // Customizes column mappings
import jakarta.persistence.Table;             // Maps to a specific table name
import java.time.LocalDateTime;              // For created_at and updated_at timestamps
import java.util.UUID;                       // For UUID type IDs

@Entity
@Table(name = "user_clubs")
public class UserClub implements Serializable {

    @Embeddable
    public static class UserClubId implements Serializable {
        private UUID userId;
        private UUID clubId;

        public UserClubId() {}
        public UserClubId(UUID userId, UUID clubId) {
            this.userId = userId;
            this.clubId = clubId;
        }

        // equals and hashCode
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof UserClubId)) return false;
            UserClubId that = (UserClubId) o;
            return Objects.equals(userId, that.userId) &&
                    Objects.equals(clubId, that.clubId);
        }
        @Override
        public int hashCode() {
            return Objects.hash(userId, clubId);
        }

        // getters and setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getClubId() { return clubId; }
        public void setClubId(UUID clubId) { this.clubId = clubId; }
    }

    @EmbeddedId
    private UserClubId id = new UserClubId();

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("clubId")
    @JoinColumn(name = "club_id")
    private Club club;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    // getters and setters
    public UserClubId getId() { return id; }
    public void setId(UserClubId id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Club getClub() { return club; }
    public void setClub(Club club) { this.club = club; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
