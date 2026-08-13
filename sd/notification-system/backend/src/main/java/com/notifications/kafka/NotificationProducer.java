package com.notifications.kafka;

import com.notifications.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendToKafka(String topic, NotificationRequest payload, String trackingId) {
        // Use userId as partition key to guarantee ordering
        String partitionKey = payload.getUserId();
        
        kafkaTemplate.send(topic, partitionKey, payload).whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Message sent to topic: {} for trackingId: {}", topic, trackingId);
            } else {
                log.error("Failed to send message to topic: {}", topic, ex);
                // In production: send to local DB (Outbox pattern) or Retry Queue
            }
        });
    }
}
