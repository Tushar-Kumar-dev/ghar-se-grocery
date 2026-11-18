package com.sibms.service;

import com.sibms.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getUnread();
    void markAllRead();
    NotificationResponse create(String type, String message);
}
