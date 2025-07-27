package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clubs")
public class Club {
    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "media_type_id")
    private MediaType mediaType;

    @ManyToOne
    @JoinColumn(name = "linked_media_id")
    private Media linkedMedia;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "last_thread_created_at")
    private LocalDateTime lastThreadCreatedAt;


    // Constructors
    public Club() {
    }

    public Club(UUID id, String name, String description, User createdBy, MediaType mediaType) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.mediaType = mediaType;
        this.createdAt = LocalDateTime.now();
    }

    public Club(UUID id, String name, String description, User createdBy, MediaType mediaType, Media linkedMedia) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.mediaType = mediaType;
        this.linkedMedia = linkedMedia;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public MediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }

    public Media getLinkedMedia() {
        return linkedMedia;
    }

    public void setLinkedMedia(Media linkedMedia) {
        this.linkedMedia = linkedMedia;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public LocalDateTime getLastThreadCreatedAt() {
        return lastThreadCreatedAt;
    }

    public void setLastThreadCreatedAt(LocalDateTime lastThreadCreatedAt) {
        this.lastThreadCreatedAt = lastThreadCreatedAt;
    }

    
}