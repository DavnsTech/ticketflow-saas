package com.davnstech.ticketflow.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank String content,
        boolean internal) {
}
