package com.notifications.api;

import com.notifications.dto.NotificationRequest;
import com.notifications.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Map<String, String>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        String trackingId = notificationService.processNotification(request);
        return ResponseEntity.accepted().body(Map.of(
                "status", "ACCEPTED",
                "tracking_id", trackingId
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<String> getNotificationStatus(@PathVariable UUID id) {
        // Implementation for status check
        return ResponseEntity.ok("Status checking placeholder");
    }
}
