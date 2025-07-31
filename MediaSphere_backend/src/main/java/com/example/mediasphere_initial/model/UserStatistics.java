package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_statistics")
public class UserStatistics {

    @Id
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "threads_created", nullable = false)
    private Integer threadsCreated = 0;

    @Column(name = "comments_posted", nullable = false)
    private Integer commentsPosted = 0;

    @Column(name = "events_attended", nullable = false)
    private Integer eventsAttended = 0;

    @Column(name = "clubs_joined", nullable = false)
    private Integer clubsJoined = 0;

    @Column(name = "likes_received", nullable = false)
    private Integer likesReceived = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public UserStatistics() {
        this.updatedAt = LocalDateTime.now();
    }

    public UserStatistics(User user) {
        this();
        this.user = user;
        this.userId = user.getId();
    }

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getThreadsCreated() {
        return threadsCreated;
    }

    public void setThreadsCreated(Integer threadsCreated) {
        this.threadsCreated = threadsCreated;
    }

    public Integer getCommentsPosted() {
        return commentsPosted;
    }

    public void setCommentsPosted(Integer commentsPosted) {
        this.commentsPosted = commentsPosted;
    }

    public Integer getEventsAttended() {
        return eventsAttended;
    }

    public void setEventsAttended(Integer eventsAttended) {
        this.eventsAttended = eventsAttended;
    }

    public Integer getClubsJoined() {
        return clubsJoined;
    }

    public void setClubsJoined(Integer clubsJoined) {
        this.clubsJoined = clubsJoined;
    }

    public Integer getLikesReceived() {
        return likesReceived;
    }

    public void setLikesReceived(Integer likesReceived) {
        this.likesReceived = likesReceived;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
