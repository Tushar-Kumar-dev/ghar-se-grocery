package com.sibms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        String email,
        String username,
        @NotBlank String password
) {
    public String getIdentifier() {
        if (email != null && !email.isBlank()) {
            String e = email.trim().toLowerCase();
            return e.contains("@") ? e : e + "@sibms.com";
        }
        if (username != null && !username.isBlank()) {
            String u = username.trim().toLowerCase();
            return u.contains("@") ? u : u + "@sibms.com";
        }
        return "";
    }
}
