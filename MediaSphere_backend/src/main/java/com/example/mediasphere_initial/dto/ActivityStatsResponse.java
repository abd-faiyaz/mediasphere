package com.example.mediasphere_initial.dto;

public class ActivityStatsResponse {
    private long totalActivities;
    private long memberJoined;
    private long threadsCreated;
    private long eventsCreated;
    private long commentsPosted;

    public ActivityStatsResponse() {
    }

    public ActivityStatsResponse(long totalActivities, long memberJoined, long threadsCreated,
            long eventsCreated, long commentsPosted) {
        this.totalActivities = totalActivities;
        this.memberJoined = memberJoined;
        this.threadsCreated = threadsCreated;
        this.eventsCreated = eventsCreated;
        this.commentsPosted = commentsPosted;
    }

    // Getters and Setters
    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    public long getMemberJoined() {
        return memberJoined;
    }

    public void setMemberJoined(long memberJoined) {
        this.memberJoined = memberJoined;
    }

    public long getThreadsCreated() {
        return threadsCreated;
    }

    public void setThreadsCreated(long threadsCreated) {
        this.threadsCreated = threadsCreated;
    }

    public long getEventsCreated() {
        return eventsCreated;
    }

    public void setEventsCreated(long eventsCreated) {
        this.eventsCreated = eventsCreated;
    }

    public long getCommentsPosted() {
        return commentsPosted;
    }

    public void setCommentsPosted(long commentsPosted) {
        this.commentsPosted = commentsPosted;
    }
}
