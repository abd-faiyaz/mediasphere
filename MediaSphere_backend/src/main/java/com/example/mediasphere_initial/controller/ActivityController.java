package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.ActivityLog;
import com.example.mediasphere_initial.service.ActivityLogService;
import com.example.mediasphere_initial.dto.ActivityStatsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Activity Management
 * 
 * Endpoints provided:
 * - GET /api/clubs/{clubId}/activity - Get recent activity for a specific club
 * - GET /api/clubs/{clubId}/activity/paginated - Get paginated activity for a
 * specific club
 * - GET /api/clubs/{clubId}/activity/count - Get activity count for a specific
 * club
 * - GET /api/users/{userId}/activity - Get paginated activity for a specific
 * user
 * - GET /api/users/{userId}/activity/count - Get activity count for a specific
 * user
 * - GET /api/activity/global - Get global activity feed (paginated)
 * - GET /api/activity/stats - Get comprehensive activity statistics
 * - GET /api/activity/count - Get activity count by type
 * 
 * All endpoints support optional Authorization header for authenticated
 * requests
 * Pagination parameters: page (default: 0), size (default: 10, max: 100)
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityLogService activityLogService;

    // Get recent activity for a club
    @GetMapping("/clubs/{clubId}/activity")
    public ResponseEntity<List<ActivityLog>> getClubActivity(
            @PathVariable UUID clubId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<ActivityLog> activities = activityLogService.getRecentClubActivity(clubId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get paginated activity for a club
    @GetMapping("/clubs/{clubId}/activity/paginated")
    public ResponseEntity<Page<ActivityLog>> getClubActivityPaginated(
            @PathVariable UUID clubId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (page < 0)
                page = 0;
            if (size <= 0 || size > 100)
                size = 10; // Limit max size

            Page<ActivityLog> activities = activityLogService.getClubActivity(clubId, page, size);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get user activity
    @GetMapping("/users/{userId}/activity")
    public ResponseEntity<Page<ActivityLog>> getUserActivity(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (page < 0)
                page = 0;
            if (size <= 0 || size > 100)
                size = 10; // Limit max size

            Page<ActivityLog> activities = activityLogService.getUserActivity(userId, page, size);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get global activity feed
    @GetMapping("/activity/global")
    public ResponseEntity<Page<ActivityLog>> getGlobalActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (page < 0)
                page = 0;
            if (size <= 0 || size > 100)
                size = 10; // Limit max size

            Page<ActivityLog> activities = activityLogService.getGlobalActivity(page, size);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get activity statistics using proper DTO
    @GetMapping("/activity/stats")
    public ResponseEntity<ActivityStatsResponse> getActivityStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            long totalActivities = activityLogService.getActivityCountByType("");
            long memberJoined = activityLogService.getActivityCountByType("member_joined");
            long threadsCreated = activityLogService.getActivityCountByType("thread_created");
            long eventsCreated = activityLogService.getActivityCountByType("event_created");
            long commentsPosted = activityLogService.getActivityCountByType("comment_posted");

            ActivityStatsResponse stats = new ActivityStatsResponse(
                    totalActivities, memberJoined, threadsCreated, eventsCreated, commentsPosted);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get user-specific activity count
    @GetMapping("/users/{userId}/activity/count")
    public ResponseEntity<Long> getUserActivityCount(
            @PathVariable UUID userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            long count = activityLogService.getUserActivityCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get club-specific activity count
    @GetMapping("/clubs/{clubId}/activity/count")
    public ResponseEntity<Long> getClubActivityCount(
            @PathVariable UUID clubId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            long count = activityLogService.getClubActivityCount(clubId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get activity count by type
    @GetMapping("/activity/count")
    public ResponseEntity<Long> getActivityCountByType(
            @RequestParam(required = false, defaultValue = "") String type,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            long count = activityLogService.getActivityCountByType(type);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
