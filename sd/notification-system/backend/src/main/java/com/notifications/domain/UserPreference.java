package com.notifications.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "user_preferences")
public class UserPreference {
    
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "email_enabled")
    private boolean emailEnabled = true;

    @Column(name = "sms_enabled")
    private boolean smsEnabled = true;

    @Column(name = "push_enabled")
    private boolean pushEnabled = true;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
