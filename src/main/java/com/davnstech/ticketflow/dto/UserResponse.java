package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String displayName,
        String role,
        LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getCreatedAt());
    }
}
