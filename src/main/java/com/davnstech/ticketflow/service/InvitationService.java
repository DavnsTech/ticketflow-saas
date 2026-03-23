package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.Invitation;
import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.domain.UserRole;
import com.davnstech.ticketflow.dto.CreateInvitationRequest;
import com.davnstech.ticketflow.dto.InvitationResponse;
import com.davnstech.ticketflow.repository.InvitationRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;
    private final boolean emailEnabled;

    public InvitationService(InvitationRepository invitationRepository,
                             UserRepository userRepository,
                             EmailNotificationService emailService,
                             @Value("${ticketflow.email.enabled}") boolean emailEnabled) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.emailEnabled = emailEnabled;
    }

    public InvitationResponse create(CreateInvitationRequest request, Long adminUserId) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("User already exists with this email");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        UserRole role = parseRole(request.role());

        Invitation invitation = new Invitation();
        invitation.setEmail(request.email());
        invitation.setRole(role);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setCreatedBy(admin);
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));

        invitationRepository.save(invitation);

        if (emailEnabled) {
            emailService.sendInvitationEmail(invitation);
        }

        return toResponse(invitation);
    }

    public List<InvitationResponse> listPending() {
        return invitationRepository.findByUsedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(Long invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        if (invitation.isUsed()) {
            throw new IllegalArgumentException("Cannot delete a used invitation");
        }
        invitationRepository.delete(invitation);
    }

    public Map<String, Object> validateToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation"));

        if (invitation.isUsed()) {
            throw new IllegalArgumentException("Invitation already used");
        }
        if (invitation.isExpired()) {
            throw new IllegalArgumentException("Invitation expired");
        }

        return Map.of("email", invitation.getEmail(), "role", invitation.getRole().name());
    }

    public Invitation consumeToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation"));

        if (invitation.isUsed()) {
            throw new IllegalArgumentException("Invitation already used");
        }
        if (invitation.isExpired()) {
            throw new IllegalArgumentException("Invitation expired");
        }

        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
        return invitation;
    }

    private UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            return UserRole.USER;
        }
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    private InvitationResponse toResponse(Invitation invitation) {
        String inviteLink = "/register?invite=" + invitation.getToken();
        return new InvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getRole().name(),
                invitation.getToken(),
                inviteLink,
                invitation.getCreatedAt().toString(),
                invitation.getExpiresAt().toString(),
                invitation.isUsed()
        );
    }
}
