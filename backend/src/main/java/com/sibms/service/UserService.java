package com.sibms.service;

import com.sibms.dto.request.ChangePasswordRequest;
import com.sibms.dto.request.CreateUserRequest;
import com.sibms.dto.request.UpdateUserRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse create(CreateUserRequest request);

    PageResponse<UserResponse> list(Pageable pageable);

    UserResponse getById(Long id);

    UserResponse getByEmail(String email);

    UserResponse update(Long id, UpdateUserRequest request, String currentEmail);

    void deactivate(Long id, String currentEmail);

    void changePassword(String email, ChangePasswordRequest request);

    void resetPassword(Long id, String newPassword, String operatorEmail);
}
