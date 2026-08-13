package com.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class NotificationRequest {
    @NotBlank(message = "User ID is mandatory")
    private String userId;

    @NotBlank(message = "Template ID is mandatory")
    private String templateId;

    private String priority = "DEFAULT";

    @NotEmpty(message = "At least one channel must be specified")
    private List<String> channels;

    private Map<String, Object> payload;

    @NotBlank(message = "Idempotency key is mandatory")
    private String idempotencyKey;
}
