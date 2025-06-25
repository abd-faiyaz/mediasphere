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
}
