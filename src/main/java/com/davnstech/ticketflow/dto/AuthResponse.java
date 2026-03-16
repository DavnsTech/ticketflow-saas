package com.davnstech.ticketflow.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String displayName,
        String role) {
}
