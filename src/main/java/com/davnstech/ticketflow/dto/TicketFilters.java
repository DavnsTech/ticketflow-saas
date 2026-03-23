package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;

import java.util.List;

public record TicketFilters(
        TicketStatus status,
        TicketPriority priority,
        Long assigneeId,
        Long requesterId,
        Long categoryId,
        List<Long> agentCategoryIds) {
}
