package com.example.mediasphere_initial.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_thread_views", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "thread_id"}))
public class UserThreadView {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private Thread thread;
    
    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;
    
    // Constructors
    public UserThreadView() {
        this.viewedAt = LocalDateTime.now();
    }
    
    public UserThreadView(User user, Thread thread) {
        this();
        this.user = user;
        this.thread = thread;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Thread getThread() {
        return thread;
    }
    
    public void setThread(Thread thread) {
        this.thread = thread;
    }
    
    public LocalDateTime getViewedAt() {
        return viewedAt;
    }
    
    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }
}
