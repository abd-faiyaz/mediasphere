package com.example.mediasphere_initial.dto;

import java.util.UUID;

public class CreateClubRequest {
    private String name;
    private String description;
    private String mediaTypeId; // UUID as string
    private String linkedMediaId; // UUID as string

    // Constructors
    public CreateClubRequest() {}

    public CreateClubRequest(String name, String description, String mediaTypeId, String linkedMediaId) {
        this.name = name;
        this.description = description;
        this.mediaTypeId = mediaTypeId;
        this.linkedMediaId = linkedMediaId;
    }

    // Getters and setters
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

    public String getMediaTypeId() {
        return mediaTypeId;
    }

    public void setMediaTypeId(String mediaTypeId) {
        this.mediaTypeId = mediaTypeId;
    }

    public String getLinkedMediaId() {
        return linkedMediaId;
    }

    public void setLinkedMediaId(String linkedMediaId) {
        this.linkedMediaId = linkedMediaId;
    }

    // Helper methods to convert to UUID
    public UUID getMediaTypeIdAsUUID() {
        return mediaTypeId != null ? UUID.fromString(mediaTypeId) : null;
    }

    public UUID getLinkedMediaIdAsUUID() {
        return linkedMediaId != null ? UUID.fromString(linkedMediaId) : null;
    }
}
