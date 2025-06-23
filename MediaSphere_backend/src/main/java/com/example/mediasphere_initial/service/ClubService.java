package com.example.mediasphere_initial.service;

import java.time.LocalDateTime;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.UserClubRepository;
import com.example.mediasphere_initial.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired; // For injecting dependencies
import java.util.UUID;                       // For UUID type IDs

@Service
public class ClubService {
    // ... other autowired repos ...
    @Autowired
    private UserClubRepository userClubRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ClubRepository clubRepository;

    // ... other methods ...

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
}