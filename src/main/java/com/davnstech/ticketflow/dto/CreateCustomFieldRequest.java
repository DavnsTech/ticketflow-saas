package com.davnstech.ticketflow.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCustomFieldRequest(
        @NotBlank String name, @NotBlank String label,
        String fieldType, boolean required,
        String options, String placeholder) {
}
