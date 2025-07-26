package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByClub(Club club);

    @Query("SELECT e FROM Event e WHERE e.club = :club AND e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEventsByClub(@Param("club") Club club, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);

    // Find events created by a user
    @Query("SELECT e FROM Event e WHERE e.createdBy.id = :userId ORDER BY e.eventDate DESC")
    List<Event> findEventsByCreatedBy(@Param("userId") UUID userId);

    // Find upcoming events from clubs the user is a member of
    @Query("SELECT e FROM Event e WHERE e.club.id IN :clubIds AND e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEventsByClubIds(@Param("clubIds") List<UUID> clubIds, @Param("now") LocalDateTime now);
}
