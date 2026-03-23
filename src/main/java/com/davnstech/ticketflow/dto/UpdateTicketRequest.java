package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;

import java.util.Set;

public record UpdateTicketRequest(
        String title,
        String description,
        TicketStatus status,
        TicketPriority priority,
        Long assigneeId,
        Long categoryId,
        Set<String> tags) {
}
