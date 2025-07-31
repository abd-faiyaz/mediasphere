package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.MediaType;
import com.example.mediasphere_initial.repository.MediaTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/media-types")
@CrossOrigin(origins = "http://localhost:3000")
public class MediaTypeController {

    @Autowired
    private MediaTypeRepository mediaTypeRepository;

    // Get all media types
    @GetMapping("/")
    public ResponseEntity<List<MediaType>> getAllMediaTypes() {
        List<MediaType> mediaTypes = mediaTypeRepository.findAll();
        return ResponseEntity.ok(mediaTypes);
    }

    // Get media type by ID
    @GetMapping("/{id}")
    public ResponseEntity<MediaType> getMediaType(@PathVariable UUID id) {
        Optional<MediaType> mediaType = mediaTypeRepository.findById(id);
        return mediaType.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // Get media type by name
    @GetMapping("/name/{typeName}")
    public ResponseEntity<MediaType> getMediaTypeByName(@PathVariable String typeName) {
        Optional<MediaType> mediaType = mediaTypeRepository.findByTypeName(typeName);
        return mediaType.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
} 