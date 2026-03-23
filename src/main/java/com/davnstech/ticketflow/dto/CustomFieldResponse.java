package com.davnstech.ticketflow.dto;

public record CustomFieldResponse(
        Long id, Long categoryId, String name, String label,
        String fieldType, boolean required, String options,
        String placeholder, int displayOrder, boolean active) {
}
