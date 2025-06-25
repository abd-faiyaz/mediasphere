package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.service.ClubService;
import com.example.mediasphere_initial.service.AuthService;
import com.example.mediasphere_initial.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/clubs")
@CrossOrigin(origins = "http://localhost:3000")
public class ClubController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private AuthService authService;

    @Autowired
    private EventService eventService;

    // List all clubs
    @GetMapping("/")
    public ResponseEntity<List<Club>> getAllClubs() {
        List<Club> clubs = clubService.getAllClubs();
        return ResponseEntity.ok(clubs);
    }

    // Create new club
    @PostMapping("/")
    public ResponseEntity<?> createClub(@RequestBody Club club, 
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            Club createdClub = clubService.createClub(club, userOpt.get());
            return ResponseEntity.status(201).body(createdClub);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get club details
    @GetMapping("/{id}")
    public ResponseEntity<Club> getClub(@PathVariable UUID id) {
        Optional<Club> club = clubService.getClubById(id);
        return club.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // Update club
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClub(@PathVariable UUID id, 
                                       @RequestBody Club club,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            Club updatedClub = clubService.updateClub(id, club, userOpt.get());
            return ResponseEntity.ok(updatedClub);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete club
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClub(@PathVariable UUID id,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            boolean deleted = clubService.deleteClub(id, userOpt.get());
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(403).body("Unauthorized to delete club");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Join club
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinClub(@PathVariable UUID id,
                                     @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            boolean joined = clubService.joinClub(id, userOpt.get().getId());
            if (joined) {
                return ResponseEntity.ok("Joined club successfully");
            } else {
                return ResponseEntity.badRequest().body("Already a member or club not found");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Leave club
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveClub(@PathVariable UUID id,
                                      @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            boolean left = clubService.leaveClub(id, userOpt.get().getId());
            if (left) {
                return ResponseEntity.ok("Left club successfully");
            } else {
                return ResponseEntity.badRequest().body("Not a member or club not found");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get discussion threads for a club
    @GetMapping("/{id}/threads")
    public ResponseEntity<List<Thread>> getClubThreads(@PathVariable UUID id) {
        try {
            List<Thread> threads = clubService.getClubThreads(id);
            return ResponseEntity.ok(threads);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create new thread in a club
    @PostMapping("/{id}/threads")
    public ResponseEntity<?> createThread(@PathVariable UUID id,
                                         @RequestBody Thread thread,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            Thread createdThread = clubService.createThread(id, thread, userOpt.get());
            return ResponseEntity.status(201).body(createdThread);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get upcoming events for a club
    @GetMapping("/{id}/events")
    public ResponseEntity<List<Event>> getClubEvents(@PathVariable UUID id) {
        try {
            List<Event> events = eventService.getUpcomingEventsByClub(id);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Schedule event for a club
    @PostMapping("/{id}/events")
    public ResponseEntity<?> createEvent(@PathVariable UUID id,
                                        @RequestBody Event event,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            Event createdEvent = eventService.createEvent(id, event, userOpt.get());
            return ResponseEntity.status(201).body(createdEvent);
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
