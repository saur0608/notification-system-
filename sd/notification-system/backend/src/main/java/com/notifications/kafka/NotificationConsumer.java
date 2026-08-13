package com.notifications.kafka;

import com.notifications.dto.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationConsumer {

    // Strategy Pattern: In a real app, this would inject a List<ChannelStrategy>
    // and select the right one based on the topic.

    @KafkaListener(topics = "notify-email", groupId = "notification-group")
    public void consumeEmail(NotificationRequest payload) {
        log.info("Processing EMAIL notification for user: {}", payload.getUserId());
        try {
            // Simulated SendGrid API call
            Thread.sleep(200); 
            log.info("Email sent successfully!");
        } catch (Exception e) {
            log.error("Failed to send email. Sending to DLQ.", e);
            // Throw exception to trigger Kafka retry or DLQ routing
        }
    }

    @KafkaListener(topics = "notify-sms", groupId = "notification-group")
    public void consumeSms(NotificationRequest payload) {
        log.info("Processing SMS notification for user: {}", payload.getUserId());
        try {
            // Simulated Twilio API call
            Thread.sleep(150); 
            log.info("SMS sent successfully!");
        } catch (Exception e) {
            log.error("Failed to send SMS", e);
        }
    }
}
