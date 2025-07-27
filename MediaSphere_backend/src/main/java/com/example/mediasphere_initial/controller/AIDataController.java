package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.repository.MediaRepository;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/data")
@CrossOrigin(origins = "*")
public class AIDataController {
    
    @Autowired
    private MediaRepository mediaRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private ThreadRepository threadRepository;
    
    @GetMapping("/media")
    public ResponseEntity<List<MediaOption>> getAllMedia() {
        try {
            List<Media> mediaList = mediaRepository.findAll();
            List<MediaOption> options = mediaList.stream()
                .map(media -> new MediaOption(media.getId().toString(), media.getTitle()))
                .collect(Collectors.toList());
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/clubs")
    public ResponseEntity<List<ClubOption>> getClubsByMedia(@RequestParam String mediaId) {
        try {
            UUID mediaUUID = UUID.fromString(mediaId);
            List<Club> clubs = clubRepository.findByLinkedMediaIdOrderByCreatedAtDesc(mediaUUID);
            List<ClubOption> options = clubs.stream()
                .map(club -> new ClubOption(club.getId().toString(), club.getName()))
                .collect(Collectors.toList());
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/threads")
    public ResponseEntity<List<ThreadOption>> getThreadsByClub(@RequestParam String clubId) {
        try {
            UUID clubUUID = UUID.fromString(clubId);
            List<com.example.mediasphere_initial.model.Thread> threads = threadRepository.findByClubIdOrderByCreatedAtDesc(clubUUID);
            List<ThreadOption> options = threads.stream()
                .limit(20) // Limit to recent 20 threads
                .map(thread -> new ThreadOption(thread.getId().toString(), thread.getTitle()))
                .collect(Collectors.toList());
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    // DTOs for API responses
    public static class MediaOption {
        private String id;
        private String title;
        
        public MediaOption(String id, String title) {
            this.id = id;
            this.title = title;
        }
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
    
    public static class ClubOption {
        private String id;
        private String name;
        
        public ClubOption(String id, String name) {
            this.id = id;
            this.name = name;
        }
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    public static class ThreadOption {
        private String id;
        private String title;
        
        public ThreadOption(String id, String title) {
            this.id = id;
            this.title = title;
        }
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
}
