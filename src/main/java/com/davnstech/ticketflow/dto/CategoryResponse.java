package com.davnstech.ticketflow.dto;

import java.util.List;

public record CategoryResponse(
        Long id, String name, String description,
        String color, String icon, boolean active,
        int displayOrder, List<Long> agentIds) {
}
