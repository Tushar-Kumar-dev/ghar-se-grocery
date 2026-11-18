package com.sibms.service.impl;

import com.sibms.dto.request.ChangePasswordRequest;
import com.sibms.dto.request.CreateUserRequest;
import com.sibms.dto.request.UpdateUserRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.UserResponse;
import com.sibms.entity.User;
import com.sibms.exception.BadRequestException;
import com.sibms.exception.DuplicateResourceException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.RefreshTokenRepository;
import com.sibms.repository.UserRepository;
import com.sibms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }
        User saved = userRepository.save(User.builder()
                .name(request.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build());
        return UserResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(Pageable pageable) {
        return PageResponse.from(userRepository.findAll(pageable).map(UserResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return UserResponse.from(findByEmail(email));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request, String currentEmail) {
        User user = findById(id);

        boolean isSelf = user.getEmail().equals(currentEmail);
        if (isSelf && (request.role() != user.getRole() || !request.active())) {
            throw new BadRequestException("You cannot change your own role or deactivate your own account");
        }

        user.setName(request.name().trim());
        user.setRole(request.role());
        user.setActive(request.active());

        if (!request.active()) {
            refreshTokenRepository.revokeAllByUser(user);
        }
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public void deactivate(Long id, String currentEmail) {
        User user = findById(id);
        if (user.getEmail().equals(currentEmail)) {
            throw new BadRequestException("You cannot deactivate your own account");
        }
        user.setActive(false);                       // soft delete: data hamesha rehta hai
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.revokeAllByUser(user);   // baaki sab devices logout
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword, String operatorEmail) {
        User user = findById(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        refreshTokenRepository.revokeAllByUser(user);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
