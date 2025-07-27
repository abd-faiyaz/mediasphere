package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.model.ClubLeaveLog;
import com.example.mediasphere_initial.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/clubs")
@CrossOrigin(origins = "http://localhost:3000")
public class ClubLeaveAnalyticsController {

    @Autowired
    private ClubService clubService;

    // Get all leave logs for a club (admin/moderator only)
    @GetMapping("/{clubId}/leave-logs")
    public ResponseEntity<List<ClubLeaveLog>> getClubLeaveLogs(@PathVariable UUID clubId) {
        List<ClubLeaveLog> leaveLogs = clubService.getClubLeaveLogs(clubId);
        return ResponseEntity.ok(leaveLogs);
    }

    // Get leave reasons for a club (admin/moderator only)
    @GetMapping("/{clubId}/leave-reasons")
    public ResponseEntity<List<ClubLeaveLog>> getClubLeaveReasons(@PathVariable UUID clubId) {
        List<ClubLeaveLog> leaveReasons = clubService.getClubLeaveReasons(clubId);
        return ResponseEntity.ok(leaveReasons);
    }

    // Get leave count for a club
    @GetMapping("/{clubId}/leave-count")
    public ResponseEntity<Long> getClubLeaveCount(@PathVariable UUID clubId) {
        long leaveCount = clubService.getClubLeaveCount(clubId);
        return ResponseEntity.ok(leaveCount);
    }
}
