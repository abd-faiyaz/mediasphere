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

    // Getters and setters
    // ...
}