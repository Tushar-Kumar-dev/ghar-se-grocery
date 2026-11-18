package com.sibms.security;

import com.sibms.enums.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "unit-test-secret-key-that-is-at-least-32-characters-long";

    @Test
    void generatedTokenIsValidAndCarriesEmail() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 60_000);
        String token = jwtUtil.generateAccessToken("admin@sibms.com", Role.ADMIN);

        assertTrue(jwtUtil.isValid(token));
        assertEquals("admin@sibms.com", jwtUtil.extractEmail(token));
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 60_000);
        String token = jwtUtil.generateAccessToken("admin@sibms.com", Role.ADMIN);

        String tampered = token.substring(0, token.length() - 4) + "xxxx";
        assertFalse(jwtUtil.isValid(tampered));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, -1_000);
        String token = jwtUtil.generateAccessToken("admin@sibms.com", Role.ADMIN);

        assertFalse(jwtUtil.isValid(token));
    }
}
