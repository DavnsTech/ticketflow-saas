package com.davnstech.ticketflow.dto;

public record InvitationResponse(
        Long id,
        String email,
        String role,
        String token,
        String inviteLink,
        String createdAt,
        String expiresAt,
        boolean used) {
}
