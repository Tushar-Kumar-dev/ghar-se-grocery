package com.sibms.service.impl;

import com.sibms.dto.response.NotificationResponse;
import com.sibms.entity.Notification;
import com.sibms.repository.NotificationRepository;
import com.sibms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnread() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc()
                .stream().map(NotificationResponse::from).toList();
    }

    @Override
    @Transactional
    public void markAllRead() {
        notificationRepository.markAllAsRead();
    }

    @Override
    @Transactional
    public NotificationResponse create(String type, String message) {
        Notification saved = notificationRepository.save(Notification.builder()
                .type(type).message(message).build());
        return NotificationResponse.from(saved);
    }
}
