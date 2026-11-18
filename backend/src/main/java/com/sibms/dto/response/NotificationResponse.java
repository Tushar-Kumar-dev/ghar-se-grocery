package com.sibms.dto.response;

import com.sibms.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(Long id, String type, String message, boolean read, LocalDateTime createdAt) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
