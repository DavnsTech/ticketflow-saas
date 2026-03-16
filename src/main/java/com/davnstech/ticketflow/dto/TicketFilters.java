package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;

public record TicketFilters(
        TicketStatus status,
        TicketPriority priority,
        Long assigneeId,
        Long requesterId) {
}
