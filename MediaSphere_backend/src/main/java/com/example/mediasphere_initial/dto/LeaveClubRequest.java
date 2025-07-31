package com.example.mediasphere_initial.dto;

public class LeaveClubRequest {
    private String reason;

    // Default constructor
    public LeaveClubRequest() {
    }

    // Constructor with reason
    public LeaveClubRequest(String reason) {
        this.reason = reason;
    }

    // Getter and setter
    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
