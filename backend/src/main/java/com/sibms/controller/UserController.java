package com.sibms.controller;

import com.sibms.dto.request.CreateUserRequest;
import com.sibms.dto.request.UpdateUserRequest;
import com.sibms.dto.response.ApiResponse;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.UserResponse;
import com.sibms.exception.BadRequestException;
import com.sibms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** User management: ADMIN & STORE MANAGER. */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public PageResponse<UserResponse> list(
            @ParameterObject @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return userService.list(pageable);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody UpdateUserRequest request,
                               Authentication authentication) {
        return userService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id, Authentication authentication) {
        userService.deactivate(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String newPassword = body != null ? body.get("newPassword") : null;
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        userService.resetPassword(id, newPassword.trim(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }
}
