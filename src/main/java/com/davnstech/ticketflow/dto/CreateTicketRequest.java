package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketPriority;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record CreateTicketRequest(
        @NotBlank String title,
        String description,
        TicketPriority priority,
        String category,
        Set<String> tags) {
}
