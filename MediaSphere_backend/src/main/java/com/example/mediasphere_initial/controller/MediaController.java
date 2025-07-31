package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.MediaService;
import com.example.mediasphere_initial.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/media")
@CrossOrigin(origins = "http://localhost:3000")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private AuthService authService;

    // Search all media/list all media with advanced filters
    @GetMapping("/")
    public ResponseEntity<List<Media>> getAllMedia(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String mediaTypeId,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Integer releaseYear,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {
        
        List<Media> media;
        
        // If any filter is provided, use advanced search
        if (search != null || mediaTypeId != null || genre != null || author != null || releaseYear != null) {
            UUID mediaTypeUUID = null;
            if (mediaTypeId != null && !mediaTypeId.trim().isEmpty()) {
                try {
                    mediaTypeUUID = UUID.fromString(mediaTypeId);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            media = mediaService.searchMediaWithFilters(search, mediaTypeUUID, genre, author, releaseYear, sortBy);
        } else {
            // Simple get all with sorting
            media = mediaService.searchMediaWithFilters(null, null, null, null, null, sortBy);
        }
        
        return ResponseEntity.ok(media);
    }

    // Create media (admin only)
    @PostMapping("/")
    public ResponseEntity<?> createMedia(@RequestBody Media media,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            User user = userOpt.get();
            if (!"admin".equals(user.getRole())) {
                return ResponseEntity.status(403).body("Admin access required");
            }
            
            Media createdMedia = mediaService.createMedia(media);
            return ResponseEntity.status(201).body(createdMedia);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get media details
    @GetMapping("/{id}")
    public ResponseEntity<Media> getMedia(@PathVariable UUID id) {
        Optional<Media> media = mediaService.getMediaById(id);
        return media.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Get media by media type ID
    @GetMapping("/by-media-type/{mediaTypeId}")
    public ResponseEntity<List<Media>> getMediaByMediaType(@PathVariable UUID mediaTypeId) {
        try {
            List<Media> media = mediaService.getMediaByMediaTypeId(mediaTypeId);
            return ResponseEntity.ok(media);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get filter options for frontend dropdowns
    @GetMapping("/filter-options")
    public ResponseEntity<?> getFilterOptions() {
        try {
            var filterOptions = new java.util.HashMap<String, Object>();
            filterOptions.put("genres", mediaService.getAllGenres());
            filterOptions.put("authors", mediaService.getAllAuthors());
            filterOptions.put("releaseYears", mediaService.getAllReleaseYears());
            return ResponseEntity.ok(filterOptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get filter options");
        }
    }

    // Delete media (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedia(@PathVariable UUID id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            User user = userOpt.get();
            if (!"admin".equals(user.getRole())) {
                return ResponseEntity.status(403).body("Admin access required");
            }
            
            boolean deleted = mediaService.deleteMedia(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Optional<User> getUserFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.getUserFromToken(token);
        }
        return Optional.empty();
    }
}
