package com.example.mediasphere_initial.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

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
        return clubRepository.save(club);
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

    public boolean leaveClub(UUID clubId, UUID userId) {
        Club club = clubRepository.findById(clubId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        return userClubRepository.findByUserAndClub(user, club).map(membership -> {
            userClubRepository.delete(membership);
            return true;
        }).orElse(false);
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
}