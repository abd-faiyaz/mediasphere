package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.dto.LeaveClubRequest;
import com.example.mediasphere_initial.dto.CreateClubRequest;
import com.example.mediasphere_initial.service.ClubService;
import com.example.mediasphere_initial.service.AuthService;
import com.example.mediasphere_initial.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    
    // Get clubs by linked media ID
    @GetMapping("/by-linked-media/{mediaId}")
    public ResponseEntity<List<Club>> getClubsByLinkedMedia(@PathVariable UUID mediaId) {
        try {
            List<Club> clubs = clubService.getClubsByLinkedMedia(mediaId);
            return ResponseEntity.ok(clubs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Create new club
    @PostMapping("/")
    public ResponseEntity<?> createClub(@RequestBody CreateClubRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Club createdClub = clubService.createClub(request, userOpt.get());
            return ResponseEntity.status(201).body(createdClub);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get club details
    @GetMapping("/{id}")
    public ResponseEntity<?> getClub(@PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<Club> clubOpt = clubService.getClubById(id);
        if (!clubOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Club club = clubOpt.get();

        // Create enhanced response with member count
        java.util.Map<String, Object> clubData = new java.util.HashMap<>();
        clubData.put("id", club.getId());
        clubData.put("name", club.getName());
        clubData.put("description", club.getDescription());
        clubData.put("mediaType", club.getMediaType());
        clubData.put("createdBy", club.getCreatedBy());
        clubData.put("createdAt", club.getCreatedAt());

        // Get member count
        long memberCount = clubService.getMemberCount(club.getId());
        clubData.put("memberCount", memberCount);

        // If user is authenticated, check membership status
        Optional<User> userOpt = getUserFromToken(authHeader);
        if (userOpt.isPresent()) {
            boolean isMember = clubService.isUserMember(club.getId(), userOpt.get().getId());
            clubData.put("isMember", isMember);
        } else {
            clubData.put("isMember", false);
        }

        return ResponseEntity.ok(clubData);
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
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) LeaveClubRequest leaveRequest) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            // Use the provided reason or empty string if not provided
            String reason = "";
            if (leaveRequest != null && leaveRequest.getReason() != null) {
                reason = leaveRequest.getReason().trim();
            }

            boolean left = clubService.leaveClub(id, userOpt.get().getId(), reason);
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
    public ResponseEntity<?> getClubThreads(@PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check if user is authenticated
            if (authHeader == null || authHeader.isEmpty()) {
                return ResponseEntity.status(401).body("Authentication required to view club discussions");
            }

            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Invalid authentication token");
            }

            User user = userOpt.get();

            // Check if user is a member of the club
            boolean isMember = clubService.isUserMemberOfClub(id, user.getId());
            if (!isMember) {
                return ResponseEntity.status(403).body("Access denied: You must be a club member to view discussions");
            }

            // User is authenticated and is a member, proceed to get threads
            List<Thread> threads = clubService.getClubThreads(id);
            return ResponseEntity.ok(threads);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Club not found");
        }
    }

    // Create new thread in a club
    @PostMapping("/{id}/threads")
    public ResponseEntity<?> createThread(@PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestHeader("Authorization") String authHeader) {

        System.out.println("=== DEBUG: Thread Creation Request ===");
        System.out.println("Club ID: " + id);
        System.out.println("Title: " + title);
        System.out.println("Content: " + content);
        System.out.println("Images count: " + (images != null ? images.length : 0));
        System.out.println("Auth header present: " + (authHeader != null));

        try {
            System.out.println("Step 1: Getting user from token");
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                System.out.println("ERROR: Authentication failed");
                return ResponseEntity.status(401).body("Authentication required");
            }
            System.out.println("Step 2: User authenticated: " + userOpt.get().getEmail());

            // Create thread object
            Thread thread = new Thread();
            thread.setTitle(title);
            thread.setContent(content);
            System.out.println("Step 3: Thread object created");

            // Use the new method that handles images
            System.out.println("Step 4: Calling createThreadWithImages service");
            Thread createdThread = clubService.createThreadWithImages(id, thread, userOpt.get(), images);
            System.out.println("Step 5: Thread created successfully with ID: " + createdThread.getId());

            return ResponseEntity.status(201).body(createdThread);
        } catch (RuntimeException e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
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

    // Update event
    @PutMapping("/events/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable UUID eventId,
            @RequestBody Event event,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            Event updatedEvent = eventService.updateEvent(eventId, event, userOpt.get());
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete event
    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable UUID eventId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            boolean deleted = eventService.deleteEvent(eventId, userOpt.get());
            if (deleted) {
                return ResponseEntity.ok().body("Event deleted successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to delete event");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Check if user is a member of a club
    @GetMapping("/{id}/membership")
    public ResponseEntity<Boolean> checkMembership(@PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.ok(false);
            }

            boolean isMember = clubService.isUserMember(id, userOpt.get().getId());
            return ResponseEntity.ok(isMember);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    // Get clubs with membership status for the authenticated user
    @GetMapping("/with-membership")
    public ResponseEntity<?> getClubsWithMembership(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            List<Club> clubs = clubService.getAllClubs();

            if (!userOpt.isPresent()) {
                // If not authenticated, return clubs without membership info
                return ResponseEntity.ok(clubs);
            }

            // Create response with membership status
            List<java.util.Map<String, Object>> clubsWithMembership = clubs.stream()
                    .map(club -> {
                        java.util.Map<String, Object> clubData = new java.util.HashMap<>();
                        clubData.put("id", club.getId());
                        clubData.put("name", club.getName());
                        clubData.put("description", club.getDescription());
                        clubData.put("mediaType", club.getMediaType());
                        clubData.put("createdBy", club.getCreatedBy());
                        clubData.put("createdAt", club.getCreatedAt());

                        // Check if user is a member
                        boolean isMember = clubService.isUserMember(club.getId(), userOpt.get().getId());
                        clubData.put("isMember", isMember);

                        // Get member count
                        long memberCount = clubService.getMemberCount(club.getId());
                        clubData.put("memberCount", memberCount);

                        return clubData;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(clubsWithMembership);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching clubs with membership");
        }
    }

    // Get club activities
    @GetMapping("/{clubId}/activities")
    public ResponseEntity<?> getClubActivities(@PathVariable UUID clubId) {
        try {
            // For now, return empty list since ActivityLog might not have all required
            // relationships
            // In the future, you can implement: List<ActivityLog> activities =
            // clubService.getClubActivities(clubId);
            return ResponseEntity.ok(java.util.Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching club activities");
        }
    }

    // Get club members
    @GetMapping("/{clubId}/members")
    public ResponseEntity<?> getClubMembers(@PathVariable UUID clubId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get current user for mutual clubs calculation
            Optional<User> currentUserOpt = Optional.empty();
            if (authHeader != null) {
                currentUserOpt = getUserFromToken(authHeader);
            }

            List<java.util.Map<String, Object>> members = clubService.getClubMembers(clubId);

            // If user is authenticated, calculate mutual clubs
            if (currentUserOpt.isPresent()) {
                User currentUser = currentUserOpt.get();
                for (java.util.Map<String, Object> memberData : members) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> userData = (java.util.Map<String, Object>) memberData.get("user");
                    UUID memberId = (UUID) userData.get("id");

                    if (!memberId.equals(currentUser.getId())) {
                        List<java.util.Map<String, Object>> mutualClubs = clubService.getMutualClubs(
                                currentUser.getId(), memberId, clubId);
                        memberData.put("mutualClubs", mutualClubs);
                    } else {
                        // For current user, show empty mutual clubs
                        memberData.put("mutualClubs", java.util.Collections.emptyList());
                    }
                }
            } else {
                // For unauthenticated users, show empty mutual clubs
                for (java.util.Map<String, Object> memberData : members) {
                    memberData.put("mutualClubs", java.util.Collections.emptyList());
                }
            }

            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching club members");
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
