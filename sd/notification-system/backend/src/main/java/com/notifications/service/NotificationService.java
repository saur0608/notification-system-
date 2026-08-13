package com.notifications.service;

import com.notifications.dto.NotificationRequest;
import com.notifications.kafka.NotificationProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationProducer producer;
    private final RedisTemplate<String, Object> redisTemplate;
    // private final PreferenceService preferenceService;

    public String processNotification(NotificationRequest request) {
        // 1. Idempotency Check at Gateway Level
        String redisKey = "idempotency:" + request.getIdempotencyKey();
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSING", 24, TimeUnit.HOURS);
        
        if (Boolean.FALSE.equals(isNew)) {
            log.info("Duplicate request detected for key: {}", request.getIdempotencyKey());
            return "DUPLICATE_ACCEPTED";
        }

        String trackingId = UUID.randomUUID().toString();

        // 2. Fetch User Preferences (Simulated)
        // if (!preferenceService.canSend(request.getUserId(), request.getChannels())) {
        //    return "SKIPPED_DUE_TO_PREFERENCES";
        // }

        // 3. Publish to Kafka topics based on channels
        for (String channel : request.getChannels()) {
            producer.sendToKafka("notify-" + channel.toLowerCase(), request, trackingId);
        }

        return trackingId;
    }
}
