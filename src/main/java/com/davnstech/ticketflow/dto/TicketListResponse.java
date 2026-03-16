package com.davnstech.ticketflow.dto;

import java.util.List;

public record TicketListResponse(
        List<TicketResponse> tickets,
        int page,
        int totalPages,
        long totalElements) {
}
