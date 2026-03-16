package com.davnstech.ticketflow.dto;

public record AgentStats(
        Long agentId,
        String agentName,
        long totalAssigned,
        long resolved) {
}
