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

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityLogService activityLogService;

    // Get recent activity for a club
    @GetMapping("/clubs/{clubId}/activity")
    public ResponseEntity<List<ActivityLog>> getClubActivity(@PathVariable UUID clubId) {
        List<ActivityLog> activities = activityLogService.getRecentClubActivity(clubId);
        return ResponseEntity.ok(activities);
    }

    // Get paginated activity for a club
    @GetMapping("/clubs/{clubId}/activity/paginated")
    public ResponseEntity<Page<ActivityLog>> getClubActivityPaginated(
            @PathVariable UUID clubId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ActivityLog> activities = activityLogService.getClubActivity(clubId, page, size);
        return ResponseEntity.ok(activities);
    }

    // Get user activity
    @GetMapping("/users/{userId}/activity")
    public ResponseEntity<Page<ActivityLog>> getUserActivity(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ActivityLog> activities = activityLogService.getUserActivity(userId, page, size);
        return ResponseEntity.ok(activities);
    }

    // Get global activity feed
    @GetMapping("/activity/global")
    public ResponseEntity<Page<ActivityLog>> getGlobalActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ActivityLog> activities = activityLogService.getGlobalActivity(page, size);
        return ResponseEntity.ok(activities);
    }

    // Get activity statistics
    @GetMapping("/activity/stats")
    public ResponseEntity<Object> getActivityStats() {
        return ResponseEntity.ok(new Object() {
            public final long totalActivities = activityLogService.getActivityCountByType("");
            public final long memberJoined = activityLogService.getActivityCountByType("member_joined");
            public final long threadsCreated = activityLogService.getActivityCountByType("thread_created");
            public final long eventsCreated = activityLogService.getActivityCountByType("event_created");
            public final long commentsPosted = activityLogService.getActivityCountByType("comment_posted");
        });
    }
}
