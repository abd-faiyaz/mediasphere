package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.service.EventService;
import com.example.mediasphere_initial.service.AuthService;
import com.example.mediasphere_initial.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    // Get event details by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Optional<Event> eventOpt = eventService.getEventById(id);
            if (!eventOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Event event = eventOpt.get();
            Map<String, Object> eventData = new HashMap<>();

            // Basic event data
            eventData.put("id", event.getId());
            eventData.put("title", event.getTitle());
            eventData.put("description", event.getDescription());
            eventData.put("eventDate", event.getEventDate());
            eventData.put("location", event.getLocation());
            eventData.put("maxParticipants", event.getMaxParticipants());
            eventData.put("currentParticipants", event.getCurrentParticipants());
            eventData.put("createdAt", event.getCreatedAt());

            // Creator info
            eventData.put("createdBy", Map.of(
                    "id", event.getCreatedBy().getId(),
                    "username", event.getCreatedBy().getUsername(),
                    "firstName", event.getCreatedBy().getFirstName() != null ? event.getCreatedBy().getFirstName() : "",
                    "lastName", event.getCreatedBy().getLastName() != null ? event.getCreatedBy().getLastName() : ""));

            // Club info
            eventData.put("club", Map.of(
                    "id", event.getClub().getId(),
                    "name", event.getClub().getName()));

            // Interest count
            int interestedCount = eventService.getInterestedUserCount(id);
            eventData.put("interestedCount", interestedCount);

            // Check if current user is interested (if authenticated)
            boolean isUserInterested = false;
            if (authHeader != null) {
                Optional<User> userOpt = getUserFromToken(authHeader);
                if (userOpt.isPresent()) {
                    isUserInterested = eventService.isUserInterested(id, userOpt.get().getId());
                }
            }
            eventData.put("isUserInterested", isUserInterested);

            return ResponseEntity.ok(eventData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching event details");
        }
    }

    // Get interested users for an event
    @GetMapping("/{id}/interested-users")
    public ResponseEntity<?> getInterestedUsers(@PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            List<User> interestedUsers = eventService.getInterestedUsers(id);

            // Format user data
            List<Map<String, Object>> userData = interestedUsers.stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("username", user.getUsername());
                        userMap.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
                        userMap.put("lastName", user.getLastName() != null ? user.getLastName() : "");
                        return userMap;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching interested users");
        }
    }

    // Show interest in an event
    @PostMapping("/{id}/interest")
    public ResponseEntity<?> showInterest(@PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            User user = userOpt.get();

            // Check if user is already interested
            if (eventService.isUserInterested(id, user.getId())) {
                return ResponseEntity.badRequest().body("User already interested in this event");
            }

            // Add interest
            eventService.addInterest(id, user);

            // Get updated counts
            int interestedCount = eventService.getInterestedUserCount(id);

            // Send notification to event creator
            Optional<Event> eventOpt = eventService.getEventById(id);
            if (eventOpt.isPresent()) {
                Event event = eventOpt.get();
                List<User> interestedUsers = eventService.getInterestedUsers(id);

                // Create notification message
                String notificationMessage = createInterestNotificationMessage(interestedUsers, user);

                notificationService.createNotification(
                        event.getCreatedBy(),
                        "Event Interest",
                        notificationMessage,
                        "EVENT_INTEREST",
                        id,
                        "EVENT");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("interestedCount", interestedCount);
            response.put("isUserInterested", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error showing interest in event");
        }
    }

    // Remove interest from an event
    @DeleteMapping("/{id}/interest")
    public ResponseEntity<?> removeInterest(@PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> userOpt = getUserFromToken(authHeader);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            User user = userOpt.get();

            // Check if user is interested
            if (!eventService.isUserInterested(id, user.getId())) {
                return ResponseEntity.badRequest().body("User not interested in this event");
            }

            // Remove interest
            eventService.removeInterest(id, user);

            // Get updated counts
            int interestedCount = eventService.getInterestedUserCount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("interestedCount", interestedCount);
            response.put("isUserInterested", false);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error removing interest from event");
        }
    }

    private String createInterestNotificationMessage(List<User> interestedUsers, User newUser) {
        if (interestedUsers.size() == 1) {
            return String.format("%s %s is interested in your event",
                    newUser.getFirstName(), newUser.getLastName());
        } else if (interestedUsers.size() <= 3) {
            StringBuilder names = new StringBuilder();
            for (int i = 0; i < interestedUsers.size(); i++) {
                User user = interestedUsers.get(i);
                names.append(user.getFirstName()).append(" ").append(user.getLastName());
                if (i < interestedUsers.size() - 2) {
                    names.append(", ");
                } else if (i == interestedUsers.size() - 2) {
                    names.append(" and ");
                }
            }
            return names.toString() + " are interested in your event";
        } else {
            // Show first 2 names and count of others
            String firstName = interestedUsers.get(0).getFirstName() + " " + interestedUsers.get(0).getLastName();
            String secondName = interestedUsers.get(1).getFirstName() + " " + interestedUsers.get(1).getLastName();
            int othersCount = interestedUsers.size() - 2;

            return String.format("%s, %s and %d others are interested in your event",
                    firstName, secondName, othersCount);
        }
    }

    // Get events created by a user
    @GetMapping("/user/{userId}/created")
    public ResponseEntity<?> getEventsCreatedByUser(@PathVariable UUID userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Event> events = eventService.getEventsCreatedByUser(userId);
            List<Map<String, Object>> eventList = events.stream().map(this::mapEventToResponse).toList();
            return ResponseEntity.ok(eventList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching events created by user");
        }
    }

    // Get upcoming events for a user (from clubs they're a member of)
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<?> getUpcomingEventsForUser(@PathVariable UUID userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Event> events = eventService.getUpcomingEventsForUser(userId);
            List<Map<String, Object>> eventList = events.stream().map(this::mapEventToResponse).toList();
            return ResponseEntity.ok(eventList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching upcoming events for user");
        }
    }

    // Get past events the user was interested in
    @GetMapping("/user/{userId}/past-interested")
    public ResponseEntity<?> getPastInterestedEventsForUser(@PathVariable UUID userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Event> events = eventService.getPastInterestedEventsForUser(userId);
            List<Map<String, Object>> eventList = events.stream().map(this::mapEventToResponse).toList();
            return ResponseEntity.ok(eventList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching past interested events for user");
        }
    }

    // Helper method to map Event to response format
    private Map<String, Object> mapEventToResponse(Event event) {
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("id", event.getId());
        eventData.put("title", event.getTitle());
        eventData.put("description", event.getDescription());
        eventData.put("eventDate", event.getEventDate());
        eventData.put("location", event.getLocation());
        eventData.put("maxParticipants", event.getMaxParticipants());
        eventData.put("currentParticipants", event.getCurrentParticipants());
        eventData.put("createdAt", event.getCreatedAt());
        eventData.put("club", event.getClub() != null ? Map.of(
                "id", event.getClub().getId(),
                "name", event.getClub().getName()) : null);
        eventData.put("interestedCount", eventService.getInterestedUserCount(event.getId()));
        return eventData;
    }

    private Optional<User> getUserFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.getUserFromToken(token);
        }
        return Optional.empty();
    }
}
