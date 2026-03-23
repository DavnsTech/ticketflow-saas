package com.davnstech.ticketflow.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank String name,
        String description, String color, String icon) {
}
