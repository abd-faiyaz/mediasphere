package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.EventRepository;
import com.example.mediasphere_initial.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubRepository clubRepository;

    public List<Event> getUpcomingEventsByClub(UUID clubId) {
        Club club = clubRepository.findById(clubId)
            .orElseThrow(() -> new RuntimeException("Club not found"));
        return eventRepository.findUpcomingEventsByClub(club, LocalDateTime.now());
    }

    public Event createEvent(UUID clubId, Event event, User user) {
        Club club = clubRepository.findById(clubId)
            .orElseThrow(() -> new RuntimeException("Club not found"));
        
        // Check if user has permission to create events in this club
        // For now, any authenticated user can create events
        
        event.setClub(club);
        event.setCreatedBy(user);
        event.setCreatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }

    public Optional<Event> getEventById(UUID eventId) {
        return eventRepository.findById(eventId);
    }

    public List<Event> getAllUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now());
    }

    public boolean deleteEvent(UUID eventId, User user) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            // Check if user has permission to delete (event creator or club admin)
            if (event.getCreatedBy().getId().equals(user.getId()) || "admin".equals(user.getRole())) {
                eventRepository.delete(event);
                return true;
            }
        }
        return false;
    }
}
