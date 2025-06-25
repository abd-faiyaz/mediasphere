package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {

    @Autowired
    private SearchService searchService;

    // Search across all entities (users, media, clubs, threads)
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> searchAll(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Map<String, Object> results = searchService.searchAll(q.trim());
        return ResponseEntity.ok(results);
    }

    // Search for clubs by name or description
    @GetMapping("/clubs")
    public ResponseEntity<List<Club>> searchClubs(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Club> clubs = searchService.searchClubs(q.trim());
        return ResponseEntity.ok(clubs);
    }

    // Search for media by title or description (with optional filter by type)
    @GetMapping("/media")
    public ResponseEntity<List<Media>> searchMedia(@RequestParam String q,
                                                  @RequestParam(required = false) String type) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Media> media = searchService.searchMedia(q.trim(), type);
        return ResponseEntity.ok(media);
    }

    // Search for discussion threads by title or content
    @GetMapping("/threads")
    public ResponseEntity<List<Thread>> searchThreads(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Thread> threads = searchService.searchThreads(q.trim());
        return ResponseEntity.ok(threads);
    }

    // Search for users by username or bio
    @GetMapping("/users")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<User> users = searchService.searchUsers(q.trim());
        return ResponseEntity.ok(users);
    }
}
