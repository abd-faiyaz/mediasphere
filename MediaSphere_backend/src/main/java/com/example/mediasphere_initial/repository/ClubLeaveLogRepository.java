package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.ClubLeaveLog;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClubLeaveLogRepository extends JpaRepository<ClubLeaveLog, UUID> {

    List<ClubLeaveLog> findByClubOrderByLeftAtDesc(Club club);

    List<ClubLeaveLog> findByUserOrderByLeftAtDesc(User user);

    @Query("SELECT COUNT(l) FROM ClubLeaveLog l WHERE l.club = :club")
    long countByClub(@Param("club") Club club);

    @Query("SELECT l FROM ClubLeaveLog l WHERE l.club = :club AND l.reason IS NOT NULL AND l.reason != ''")
    List<ClubLeaveLog> findByClubWithReason(@Param("club") Club club);
}
