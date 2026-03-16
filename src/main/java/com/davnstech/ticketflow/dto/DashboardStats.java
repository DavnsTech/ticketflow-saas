package com.davnstech.ticketflow.dto;

public record DashboardStats(
        long totalTickets,
        long openTickets,
        long inProgressTickets,
        long resolvedToday,
        Double averageResolutionTimeHours) {
}
