package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.UserClub;
import com.example.mediasphere_initial.model.UserClub.UserClubId;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserClubRepository extends JpaRepository<UserClub, UserClubId> {
    boolean existsByUserAndClub(User user, Club club);
    Optional<UserClub> findByUserAndClub(User user, Club club);
    List<UserClub> findByUser(User user);
    List<UserClub> findByClub(Club club);
    long countByClub(Club club);
}
