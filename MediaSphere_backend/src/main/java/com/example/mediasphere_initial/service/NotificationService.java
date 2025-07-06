package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Notification;
import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationStreamService notificationStreamService;

    public List<Notification> getAllUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public Optional<Notification> getNotificationById(UUID id) {
        return notificationRepository.findById(id);
    }

    public Notification updateNotification(UUID notificationId, Notification updatedNotification, User user) {
        Notification existingNotification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Check if the notification belongs to the user
        if (!existingNotification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update notification");
        }

        // Only allow updating isRead status and content (if allowed)
        if (updatedNotification.getIsRead() != null) {
            existingNotification.setIsRead(updatedNotification.getIsRead());
        }

        return notificationRepository.save(existingNotification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public Notification createNotification(User user, String title, String content, String type, UUID referenceId,
            String referenceType) {
        return createNotification(user, null, title, content, type, referenceId, referenceType);
    }

    public Notification createNotification(User user, User actor, String title, String content, String type,
            UUID referenceId,
            String referenceType) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUser(user);
        notification.setActor(actor);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);

        // Send real-time notification to user
        notificationStreamService.sendNotificationToUser(user.getId(), savedNotification);

        return savedNotification;
    }

    // Helper method to create and send notifications for common actions
    public void createAndSendNotification(User targetUser, String title, String content, String type, UUID referenceId,
            String referenceType) {
        createNotification(targetUser, title, content, type, referenceId, referenceType);
    }

    // Helper method to create and send notifications with actor information
    public void createAndSendNotification(User targetUser, User actor, String title, String content, String type,
            UUID referenceId,
            String referenceType) {
        createNotification(targetUser, actor, title, content, type, referenceId, referenceType);
    }

    // Method to send notification for thread comments
    public void notifyThreadComment(User threadOwner, User commenter, String threadTitle, UUID threadId) {
        if (!threadOwner.getId().equals(commenter.getId())) { // Don't notify self
            String title = "New comment on your thread";
            String content = commenter.getUsername() + " commented on '" + threadTitle + "'";
            createAndSendNotification(threadOwner, commenter, title, content, "comment", threadId, "thread");
        }
    }

    // Method to send notification for thread replies
    public void notifyThreadReply(User commentOwner, User replier, String threadTitle, UUID threadId) {
        if (!commentOwner.getId().equals(replier.getId())) { // Don't notify self
            String title = "New reply to your comment";
            String content = replier.getUsername() + " replied to your comment in '" + threadTitle + "'";
            createAndSendNotification(commentOwner, replier, title, content, "thread_reply", threadId, "thread");
        }
    }

    // Method to send notification for thread likes
    public void notifyThreadLike(User threadOwner, User liker, String threadTitle, UUID threadId) {
        if (!threadOwner.getId().equals(liker.getId())) { // Don't notify self
            String title = "Thread liked";
            String content = liker.getUsername() + " liked your thread '" + threadTitle + "'";
            createAndSendNotification(threadOwner, liker, title, content, "thread_like", threadId, "thread");
        }
    }

    // Method to send notification for comment likes
    public void notifyCommentLike(User commentOwner, User liker, String threadTitle, UUID threadId) {
        if (!commentOwner.getId().equals(liker.getId())) { // Don't notify self
            String title = "Comment liked";
            String content = liker.getUsername() + " liked your comment in '" + threadTitle + "'";
            createAndSendNotification(commentOwner, liker, title, content, "comment_like", threadId, "thread");
        }
    }

    // Method to send notification for thread dislikes
    public void notifyThreadDislike(User threadOwner, User disliker, String threadTitle, UUID threadId) {
        if (!threadOwner.getId().equals(disliker.getId())) { // Don't notify self
            String title = "Thread disliked";
            String content = disliker.getUsername() + " disliked your thread '" + threadTitle + "'";
            createAndSendNotification(threadOwner, disliker, title, content, "thread_dislike", threadId, "thread");
        }
    }

    // Method to send notification for comment dislikes
    public void notifyCommentDislike(User commentOwner, User disliker, String threadTitle, UUID threadId) {
        if (!commentOwner.getId().equals(disliker.getId())) { // Don't notify self
            String title = "Comment disliked";
            String content = disliker.getUsername() + " disliked your comment in '" + threadTitle + "'";
            createAndSendNotification(commentOwner, disliker, title, content, "comment_dislike", threadId, "thread");
        }
    }

    // Method to send notification for club member join
    public void notifyClubJoin(List<User> clubMembers, User newMember, String clubName, UUID clubId) {
        for (User member : clubMembers) {
            if (!member.getId().equals(newMember.getId())) { // Don't notify the new member
                String title = "New club member";
                String content = newMember.getUsername() + " joined " + clubName;
                createAndSendNotification(member, newMember, title, content, "club_join", clubId, "club");
            }
        }
    }

    // Method to send notification for club member leave
    public void notifyClubLeave(List<User> clubMembers, User leavingMember, String clubName, UUID clubId) {
        for (User member : clubMembers) {
            if (!member.getId().equals(leavingMember.getId())) { // Don't notify the leaving member
                String title = "Member left club";
                String content = leavingMember.getUsername() + " left " + clubName;
                createAndSendNotification(member, leavingMember, title, content, "club_leave", clubId, "club");
            }
        }
    }

    // Method to send notification for new club thread
    public void notifyClubThreadCreated(List<User> clubMembers, User creator, String threadTitle, String clubName,
            UUID threadId) {
        for (User member : clubMembers) {
            if (!member.getId().equals(creator.getId())) { // Don't notify the creator
                String title = "New thread in " + clubName;
                String content = creator.getUsername() + " created '" + threadTitle + "' in " + clubName;
                createAndSendNotification(member, creator, title, content, "club_thread_created", threadId, "thread");
            }
        }
    }

    // Method to send notification for event creation
    public void notifyEventCreated(List<User> clubMembers, User creator, String eventTitle, String clubName, UUID eventId) {
        for (User member : clubMembers) {
            if (!member.getId().equals(creator.getId())) { // Don't notify the creator
                String title = "New event in " + clubName;
                String content = creator.getUsername() + " created event '" + eventTitle + "' in " + clubName;
                createAndSendNotification(member, creator, title, content, "event_created", eventId, "event");
            }
        }
    }

    // Method to send notification for event updates
    public void notifyEventUpdated(List<User> participants, User updater, String eventTitle, UUID eventId) {
        for (User participant : participants) {
            if (!participant.getId().equals(updater.getId())) { // Don't notify the updater
                String title = "Event updated";
                String content = updater.getUsername() + " updated event '" + eventTitle + "'";
                createAndSendNotification(participant, updater, title, content, "event_updated", eventId, "event");
            }
        }
    }

    // Method to send notification for event cancellation
    public void notifyEventCancelled(List<User> participants, User canceller, String eventTitle, UUID eventId) {
        for (User participant : participants) {
            if (!participant.getId().equals(canceller.getId())) { // Don't notify the canceller
                String title = "Event cancelled";
                String content = canceller.getUsername() + " cancelled event '" + eventTitle + "'";
                createAndSendNotification(participant, canceller, title, content, "event_cancelled", eventId, "event");
            }
        }
    }

    // Method to send notification for event reminders
    public void notifyEventReminder(List<User> participants, String eventTitle, UUID eventId) {
        for (User participant : participants) {
            String title = "Event reminder";
            String content = "Event '" + eventTitle + "' is starting soon";
            createAndSendNotification(participant, null, title, content, "event_reminder", eventId, "event");
        }
    }

    // Method to send notification for general reactions (emojis, custom reactions)
    public void notifyReaction(User targetUser, User reactor, String reactionType, String contentType, String contentTitle, UUID contentId) {
        if (!targetUser.getId().equals(reactor.getId())) { // Don't notify self
            String title = "New reaction";
            String content = reactor.getUsername() + " reacted " + reactionType + " to your " + contentType;
            if (contentTitle != null && !contentTitle.isEmpty()) {
                content += " '" + contentTitle + "'";
            }
            createAndSendNotification(targetUser, reactor, title, content, "reaction", contentId, contentType);
        }
    }

    // Method to send notification for user mentions
    public void notifyMention(User mentionedUser, User mentioner, String contentType, String contentTitle, UUID contentId) {
        if (!mentionedUser.getId().equals(mentioner.getId())) { // Don't notify self
            String title = "You were mentioned";
            String content = mentioner.getUsername() + " mentioned you in " + contentType;
            if (contentTitle != null && !contentTitle.isEmpty()) {
                content += " '" + contentTitle + "'";
            }
            createAndSendNotification(mentionedUser, mentioner, title, content, "mention", contentId, contentType);
        }
    }

    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
