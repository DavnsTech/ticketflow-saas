package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.Ticket;

import java.time.LocalDateTime;
import java.util.Set;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String status,
        String priority,
        String category,
        String requesterName,
        Long requesterId,
        String assigneeName,
        Long assigneeId,
        Set<String> tags,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt) {

    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus().name(),
                ticket.getPriority().name(),
                ticket.getCategory(),
                ticket.getRequester().getDisplayName(),
                ticket.getRequester().getId(),
                ticket.getAssignee() != null ? ticket.getAssignee().getDisplayName() : null,
                ticket.getAssignee() != null ? ticket.getAssignee().getId() : null,
                ticket.getTags(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt());
    }
}
