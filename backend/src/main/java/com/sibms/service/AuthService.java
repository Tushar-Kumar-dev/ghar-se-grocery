package com.sibms.service;

import com.sibms.dto.request.LoginRequest;
import com.sibms.dto.request.RefreshTokenRequest;
import com.sibms.dto.request.RegisterRequest;
import com.sibms.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);
}
