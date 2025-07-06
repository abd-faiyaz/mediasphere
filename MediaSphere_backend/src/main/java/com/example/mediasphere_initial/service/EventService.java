package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Event;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.EventRepository;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.service.NotificationService;
import com.example.mediasphere_initial.service.ClubService;
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

    @Autowired
    private ClubService clubService;

    @Autowired
    private NotificationService notificationService;

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
        
        Event savedEvent = eventRepository.save(event);
        
        // Send notifications to club members about the new event
        List<User> clubMembers = clubService.getClubMembersAsUsers(clubId);
        notificationService.notifyEventCreated(clubMembers, user, event.getTitle(), club.getName(), savedEvent.getId());
        
        return savedEvent;
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
                // Send notifications to club members about event cancellation
                List<User> clubMembers = clubService.getClubMembersAsUsers(event.getClub().getId());
                notificationService.notifyEventCancelled(clubMembers, user, event.getTitle(), eventId);
                
                eventRepository.delete(event);
                return true;
            }
        }
        return false;
    }

    public Event updateEvent(UUID eventId, Event updatedEvent, User user) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            // Check if user has permission to update (event creator or club admin)
            if (event.getCreatedBy().getId().equals(user.getId()) || "admin".equals(user.getRole())) {
                // Update event fields
                if (updatedEvent.getTitle() != null) {
                    event.setTitle(updatedEvent.getTitle());
                }
                if (updatedEvent.getDescription() != null) {
                    event.setDescription(updatedEvent.getDescription());
                }
                if (updatedEvent.getEventDate() != null) {
                    event.setEventDate(updatedEvent.getEventDate());
                }
                if (updatedEvent.getLocation() != null) {
                    event.setLocation(updatedEvent.getLocation());
                }
                if (updatedEvent.getMaxParticipants() != null) {
                    event.setMaxParticipants(updatedEvent.getMaxParticipants());
                }
                event.setUpdatedAt(LocalDateTime.now());
                
                Event savedEvent = eventRepository.save(event);
                
                // Send notifications to club members about event update
                List<User> clubMembers = clubService.getClubMembersAsUsers(event.getClub().getId());
                notificationService.notifyEventUpdated(clubMembers, user, event.getTitle(), eventId);
                
                return savedEvent;
            } else {
                throw new RuntimeException("Unauthorized to update event");
            }
        } else {
            throw new RuntimeException("Event not found");
        }
    }
}
