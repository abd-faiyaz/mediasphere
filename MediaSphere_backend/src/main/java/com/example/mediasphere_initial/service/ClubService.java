package com.example.mediasphere_initial.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.io.IOException;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.ThreadImage;
import com.example.mediasphere_initial.model.ClubLeaveLog;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.ThreadImageRepository;
import com.example.mediasphere_initial.repository.ClubLeaveLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ClubService {

    @Autowired
    private UserClubRepository userClubRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ClubRepository clubRepository;
    @Autowired
    private ThreadRepository threadRepository;
    @Autowired
    private ThreadImageRepository threadImageRepository;
    @Autowired
    private ClubLeaveLogRepository clubLeaveLogRepository;
    @Autowired
    private ActivityLogService activityLogService;
    @Autowired
    private ImageUploadService imageUploadService;

    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    public Optional<Club> getClubById(UUID id) {
        return clubRepository.findById(id);
    }

    public Club createClub(Club club, User creator) {
        club.setId(UUID.randomUUID());
        club.setCreatedBy(creator);
        club.setCreatedAt(LocalDateTime.now());
        Club savedClub = clubRepository.save(club);
        // Add creator as a member
        if (!userClubRepository.existsByUserAndClub(creator, savedClub)) {
            UserClub membership = new UserClub();
            membership.setUser(creator);
            membership.setClub(savedClub);
            membership.setJoinedAt(LocalDateTime.now());
            userClubRepository.save(membership);
        }
        return savedClub;
    }

    public Club updateClub(UUID clubId, Club updatedClub, User user) {
        Club existingClub = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        // Check if user is the creator or admin
        if (!existingClub.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized to update club");
        }

        existingClub.setName(updatedClub.getName());
        existingClub.setDescription(updatedClub.getDescription());
        existingClub.setMediaType(updatedClub.getMediaType());

        return clubRepository.save(existingClub);
    }

    public boolean deleteClub(UUID clubId, User user) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        // Check if user is the creator or admin
        if (!club.getCreatedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return false;
        }

        clubRepository.delete(club);
        return true;
    }

    public boolean joinClub(UUID clubId, UUID userId) {
        Club club = clubRepository.findById(clubId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        if (!userClubRepository.existsByUserAndClub(user, club)) {
            UserClub membership = new UserClub();
            membership.setUser(user);
            membership.setClub(club);
            membership.setJoinedAt(LocalDateTime.now());
            userClubRepository.save(membership);
            return true;
        }
        return false;
    }

    public boolean leaveClub(UUID clubId, UUID userId, String reason) {
        Club club = clubRepository.findById(clubId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        return userClubRepository.findByUserAndClub(user, club).map(membership -> {
            // Save leave reason to database before removing membership
            ClubLeaveLog leaveLog = new ClubLeaveLog(user, club, reason);
            clubLeaveLogRepository.save(leaveLog);

            // Log activity for the club's activity feed
            if (activityLogService != null) {
                activityLogService.logMemberLeft(userId, clubId, reason);
            }

            // Log for console output as well
            System.out.println(
                    "User " + user.getUsername() + " is leaving club " + club.getName() + " for reason: " + reason);

            // Remove membership
            userClubRepository.delete(membership);
            return true;
        }).orElse(false);
    }

    // New method to get leave reasons for a club
    public List<ClubLeaveLog> getClubLeaveReasons(UUID clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null)
            return List.of();
        return clubLeaveLogRepository.findByClubWithReason(club);
    }

    // New method to get all leave logs for a club
    public List<ClubLeaveLog> getClubLeaveLogs(UUID clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null)
            return List.of();
        return clubLeaveLogRepository.findByClubOrderByLeftAtDesc(club);
    }

    // New method to count total leaves for a club
    public long getClubLeaveCount(UUID clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null)
            return 0;
        return clubLeaveLogRepository.countByClub(club);
    }

    public List<Thread> getClubThreads(UUID clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        return threadRepository.findByClub(club);
    }

    public Thread createThread(UUID clubId, Thread thread, User creator) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        // Check if user is a member of the club
        if (!userClubRepository.existsByUserAndClub(creator, club) && !"admin".equals(creator.getRole())) {
            throw new RuntimeException("Must be a member of the club to create threads");
        }

        thread.setId(UUID.randomUUID());
        thread.setClub(club);
        thread.setCreatedBy(creator);
        thread.setCreatedAt(LocalDateTime.now());
        thread.setViewCount(0);
        thread.setCommentCount(0);
        thread.setIsPinned(false);
        thread.setIsLocked(false);

        return threadRepository.save(thread);
    }

    public Thread createThreadWithImages(UUID clubId, Thread thread, User creator, MultipartFile[] images) {
        System.out.println("=== DEBUG: ClubService.createThreadWithImages ===");
        System.out.println("Club ID: " + clubId);
        System.out.println("Creator: " + creator.getEmail());
        System.out.println("Images: " + (images != null ? images.length : 0));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        System.out.println("Club found: " + club.getName());

        // Check if user is a member of the club
        boolean isMember = userClubRepository.existsByUserAndClub(creator, club);
        boolean isAdmin = "admin".equals(creator.getRole());
        System.out.println("Is member: " + isMember + ", Is admin: " + isAdmin);

        if (!isMember && !isAdmin) {
            throw new RuntimeException("Must be a member of the club to create threads");
        }

        thread.setId(UUID.randomUUID());
        thread.setClub(club);
        thread.setCreatedBy(creator);
        thread.setCreatedAt(LocalDateTime.now());
        thread.setViewCount(0);
        thread.setCommentCount(0);
        thread.setIsPinned(false);
        thread.setIsLocked(false);
        System.out.println("Thread prepared for saving");

        // Save thread first
        Thread savedThread = threadRepository.save(thread);
        System.out.println("Thread saved with ID: " + savedThread.getId());

        // Handle image uploads
        if (images != null && images.length > 0) {
            System.out.println("Processing " + images.length + " images");
            List<ThreadImage> threadImages = new ArrayList<>();
            for (MultipartFile image : images) {
                try {
                    System.out.println("Uploading image: " + image.getOriginalFilename());
                    String imagePath = imageUploadService.uploadImage(image, savedThread.getId());
                    ThreadImage threadImage = new ThreadImage(
                            savedThread,
                            imagePath,
                            image.getOriginalFilename(),
                            image.getSize(),
                            image.getContentType());
                    threadImages.add(threadImageRepository.save(threadImage));
                    System.out.println("Image saved: " + imagePath);
                } catch (IOException e) {
                    // Log error but don't fail the entire operation
                    System.err.println("Failed to upload image: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            savedThread.setImages(threadImages);
            System.out.println("All images processed");
        }

        // Update club activity tracking
        updateClubActivityForNewThread(clubId);

        System.out.println("Thread creation completed successfully");
        return savedThread;
    }

    // Check if a user is a member of a specific club
    public boolean isUserMember(UUID clubId, UUID userId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (club == null || user == null) {
            return false;
        }

        return userClubRepository.existsByUserAndClub(user, club);
    }

    // New method to check if a user is a member of a club
    public boolean isUserMemberOfClub(UUID clubId, UUID userId) {
        try {
            Club club = clubRepository.findById(clubId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);

            if (club == null || user == null) {
                return false;
            }

            return userClubRepository.existsByUserAndClub(user, club);
        } catch (Exception e) {
            System.err.println("Error checking club membership: " + e.getMessage());
            return false;
        }
    }

    // Get member count for a club
    public long getMemberCount(UUID clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null) {
            return 0;
        }

        return userClubRepository.countByClub(club);
    }

    // Get club members with details and mutual clubs
    public List<java.util.Map<String, Object>> getClubMembers(UUID clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null) {
            return java.util.Collections.emptyList();
        }

        List<UserClub> memberships = userClubRepository.findByClub(club);

        return memberships.stream()
                .map(membership -> {
                    java.util.Map<String, Object> memberData = new java.util.HashMap<>();
                    // Use user ID as the unique identifier for the member
                    memberData.put("id", membership.getUser().getId());
                    memberData.put("joinedAt", membership.getJoinedAt().toString());

                    // User details
                    java.util.Map<String, Object> userData = new java.util.HashMap<>();
                    User user = membership.getUser();
                    userData.put("id", user.getId());
                    userData.put("username", user.getUsername());
                    userData.put("firstName", user.getFirstName());
                    userData.put("lastName", user.getLastName());
                    userData.put("email", user.getEmail());
                    memberData.put("user", userData);

                    // Get mutual clubs (placeholder implementation)
                    // For now, return empty list. In a full implementation, you would:
                    // 1. Get current user from authentication context
                    // 2. Find clubs that both current user and this member belong to
                    // 3. Exclude the current club from the list
                    java.util.List<java.util.Map<String, Object>> mutualClubs = new java.util.ArrayList<>();

                    // Example of how mutual clubs could be found:
                    // You can implement this logic based on your authentication context
                    // List<UserClub> currentUserMemberships =
                    // userClubRepository.findByUser(currentUser);
                    // List<UserClub> memberMemberships = userClubRepository.findByUser(user);
                    // Find intersection and convert to map format

                    memberData.put("mutualClubs", mutualClubs);

                    return memberData;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    // Helper method to get mutual clubs between two users
    public List<java.util.Map<String, Object>> getMutualClubs(UUID currentUserId, UUID otherUserId,
            UUID excludeClubId) {
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        User otherUser = userRepository.findById(otherUserId).orElse(null);

        if (currentUser == null || otherUser == null) {
            return java.util.Collections.emptyList();
        }

        List<UserClub> currentUserMemberships = userClubRepository.findByUser(currentUser);
        List<UserClub> otherUserMemberships = userClubRepository.findByUser(otherUser);

        // Get club IDs that both users belong to
        java.util.Set<UUID> currentUserClubIds = currentUserMemberships.stream()
                .map(membership -> membership.getClub().getId())
                .collect(java.util.stream.Collectors.toSet());

        return otherUserMemberships.stream()
                .filter(membership -> currentUserClubIds.contains(membership.getClub().getId()))
                .filter(membership -> !membership.getClub().getId().equals(excludeClubId)) // Exclude current club
                .map(membership -> {
                    java.util.Map<String, Object> clubData = new java.util.HashMap<>();
                    Club mutualClub = membership.getClub();
                    clubData.put("id", mutualClub.getId());
                    clubData.put("name", mutualClub.getName());
                    return clubData;
                })
                .limit(5) // Limit to prevent too much data
                .collect(java.util.stream.Collectors.toList());
    }

    // Get club activities (placeholder for future implementation)
    public List<java.util.Map<String, Object>> getClubActivities(UUID clubId) {
        // This can be implemented later when ActivityLog relationships are properly set
        // up
        // For now, return empty list to avoid errors
        return java.util.Collections.emptyList();
    }

    // Update club activity tracking when a new thread is created
    public void updateClubActivityForNewThread(UUID clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        LocalDateTime now = LocalDateTime.now();
        club.setLastActivityAt(now);
        club.setLastThreadCreatedAt(now);

        clubRepository.save(club);
        System.out.println("Club activity updated for club: " + club.getName());
    }
}