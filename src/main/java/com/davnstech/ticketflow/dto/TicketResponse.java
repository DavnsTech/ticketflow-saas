package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.Ticket;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String status,
        String priority,
        String category,
        Long categoryId,
        String categoryColor,
        String requesterName,
        Long requesterId,
        String assigneeName,
        Long assigneeId,
        Set<String> tags,
        Map<String, String> customFields,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt) {

    public static TicketResponse from(Ticket ticket) {
        Map<String, String> customFieldMap = ticket.getCustomValues() != null
                ? ticket.getCustomValues().stream()
                    .collect(Collectors.toMap(
                            cv -> cv.getCustomField().getLabel(),
                            cv -> cv.getValue() != null ? cv.getValue() : "",
                            (a, b) -> a))
                : Map.of();

        String categoryName = ticket.getCategoryEntity() != null ? ticket.getCategoryEntity().getName() : ticket.getCategory();
        String categoryColor = ticket.getCategoryEntity() != null ? ticket.getCategoryEntity().getColor() : null;
        Long catId = ticket.getCategoryEntity() != null ? ticket.getCategoryEntity().getId() : null;

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus().name(),
                ticket.getPriority().name(),
                categoryName,
                catId,
                categoryColor,
                ticket.getRequester().getDisplayName(),
                ticket.getRequester().getId(),
                ticket.getAssignee() != null ? ticket.getAssignee().getDisplayName() : null,
                ticket.getAssignee() != null ? ticket.getAssignee().getId() : null,
                ticket.getTags(),
                customFieldMap,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt());
    }
}
