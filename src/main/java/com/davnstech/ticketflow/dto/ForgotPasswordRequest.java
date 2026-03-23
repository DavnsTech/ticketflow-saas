package com.davnstech.ticketflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank @Email String email,
        String website,
        String captchaToken,
        Integer captchaAngle) {
}
