package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.Set;

public record CreateTicketRequest(
        @NotBlank String title,
        String description,
        TicketPriority priority,
        @NotNull Long categoryId,
        Set<String> tags,
        Map<Long, String> customFieldValues) {
}
