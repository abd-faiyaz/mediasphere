package com.example.mediasphere_initial.dto;

import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for feed threads that includes user-specific reaction data
 */
public class FeedThreadDto {
    private UUID id;
    private String title;
    private String content;
    private String clubId;
    private String clubName;
    private String clubMediaId;
    private String authorId;
    private String authorUsername;
    private String authorProfilePic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActivityAt;
    private Integer viewCount;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer commentCount;
    
    // User-specific reaction data
    private Boolean isLiked;
    private Boolean isDisliked;
    private Double trendingScore;

    // Constructors
    public FeedThreadDto() {}

    public FeedThreadDto(Thread thread) {
        this.id = thread.getId();
        this.title = thread.getTitle();
        this.content = thread.getContent();
        this.createdAt = thread.getCreatedAt();
        this.updatedAt = thread.getUpdatedAt();
        this.lastActivityAt = thread.getLastActivityAt();
        this.viewCount = thread.getViewCount();
        this.likeCount = thread.getLikeCount();
        this.dislikeCount = thread.getDislikeCount();
        this.commentCount = thread.getCommentCount();
        
        // Set club data
        if (thread.getClub() != null) {
            Club club = thread.getClub();
            this.clubId = club.getId().toString();
            this.clubName = club.getName();
            if (club.getMediaType() != null) {
                this.clubMediaId = club.getMediaType().getName(); // Use MediaType name instead
            }
        }
        
        // Set author data
        if (thread.getCreatedBy() != null) {
            User author = thread.getCreatedBy();
            this.authorId = author.getId().toString();
            this.authorUsername = author.getUsername();
            this.authorProfilePic = author.getProfilePic();
        }
        
        // Default reaction values (will be updated later)
        this.isLiked = false;
        this.isDisliked = false;
        this.trendingScore = 0.0;
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getClubId() {
        return clubId;
    }

    public void setClubId(String clubId) {
        this.clubId = clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public void setClubName(String clubName) {
        this.clubName = clubName;
    }

    public String getClubMediaId() {
        return clubMediaId;
    }

    public void setClubMediaId(String clubMediaId) {
        this.clubMediaId = clubMediaId;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getAuthorProfilePic() {
        return authorProfilePic;
    }

    public void setAuthorProfilePic(String authorProfilePic) {
        this.authorProfilePic = authorProfilePic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }

    public Integer getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }

    public Integer getDislikeCount() {
        return dislikeCount;
    }

    public void setDislikeCount(Integer dislikeCount) {
        this.dislikeCount = dislikeCount;
    }

    public Integer getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Boolean getIsLiked() {
        return isLiked;
    }

    public void setIsLiked(Boolean isLiked) {
        this.isLiked = isLiked;
    }

    public Boolean getIsDisliked() {
        return isDisliked;
    }

    public void setIsDisliked(Boolean isDisliked) {
        this.isDisliked = isDisliked;
    }

    public Double getTrendingScore() {
        return trendingScore;
    }

    public void setTrendingScore(Double trendingScore) {
        this.trendingScore = trendingScore;
    }
}
