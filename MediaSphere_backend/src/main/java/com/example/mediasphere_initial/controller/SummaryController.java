package com.example.mediasphere_initial.controller;

import com.example.mediasphere_initial.dto.SummaryRequest;
import com.example.mediasphere_initial.dto.SummaryResponse;
import com.example.mediasphere_initial.service.SummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai/summary")
@CrossOrigin(origins = "*")
public class SummaryController {
    
    @Autowired
    private SummaryService summaryService;
    
    @PostMapping("/generate")
    public ResponseEntity<SummaryResponse> generateSummary(@RequestBody SummaryRequest request) {
        try {
            // For now, use a dummy user ID. In production, extract from JWT token
            UUID userId = UUID.randomUUID(); // TODO: Get from authentication context
            
            SummaryResponse response = summaryService.generateSummary(request, userId);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            SummaryResponse errorResponse = new SummaryResponse(false, "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testSummaryEndpoint() {
        return ResponseEntity.ok("Summary service is available");
    }
}
