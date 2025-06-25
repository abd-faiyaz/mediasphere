package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "media_types")
public class MediaType {
    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    // Constructors
    public MediaType() {}

    public MediaType(UUID id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
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
}