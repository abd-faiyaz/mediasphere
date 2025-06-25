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

    // Search all media/list all media
    @GetMapping("/")
    public ResponseEntity<List<Media>> getAllMedia(@RequestParam(required = false) String search) {
        List<Media> media;
        if (search != null && !search.trim().isEmpty()) {
            media = mediaService.searchMedia(search);
        } else {
            media = mediaService.getAllMedia();
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
