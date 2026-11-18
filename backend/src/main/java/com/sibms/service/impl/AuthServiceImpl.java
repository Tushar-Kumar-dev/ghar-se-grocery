package com.sibms.service.impl;

import com.sibms.dto.request.LoginRequest;
import com.sibms.dto.request.RefreshTokenRequest;
import com.sibms.dto.request.RegisterRequest;
import com.sibms.dto.response.AuthResponse;
import com.sibms.dto.response.UserResponse;
import com.sibms.entity.RefreshToken;
import com.sibms.entity.User;
import com.sibms.enums.Role;
import com.sibms.exception.DuplicateResourceException;
import com.sibms.exception.UnauthorizedException;
import com.sibms.repository.RefreshTokenRepository;
import com.sibms.repository.UserRepository;
import com.sibms.security.JwtUtil;
import com.sibms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getIdentifier();

        // galat password ya deactivated account par exception aayegi (handler 401 bhejega)
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        Role role = request.role() != null ? request.role() : Role.CASHIER;

        User user = userRepository.save(User.builder()
                .name(request.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .active(true)
                .build());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (stored.isRevoked() || stored.isExpired()) {
            throw new UnauthorizedException("Refresh token expired or revoked. Please login again.");
        }
        User user = stored.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }

        // rotation: purana token band, naya issue
        stored.setRevoked(true);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(t -> t.setRevoked(true));
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken, "Bearer",
                jwtUtil.getAccessExpirationMs(), UserResponse.from(user));
    }

    private String createRefreshToken(User user) {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        refreshTokenRepository.save(RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L))
                .revoked(false)
                .build());
        return token;
    }
}
