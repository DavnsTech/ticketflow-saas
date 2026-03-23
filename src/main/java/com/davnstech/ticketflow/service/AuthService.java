package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.domain.UserRole;
import com.davnstech.ticketflow.dto.AuthResponse;
import com.davnstech.ticketflow.dto.ForgotPasswordRequest;
import com.davnstech.ticketflow.dto.LoginRequest;
import com.davnstech.ticketflow.dto.RegisterRequest;
import com.davnstech.ticketflow.dto.ResetPasswordRequest;
import com.davnstech.ticketflow.exception.RateLimitException;
import com.davnstech.ticketflow.repository.UserRepository;
import com.davnstech.ticketflow.security.JwtTokenProvider;
import com.davnstech.ticketflow.security.RateLimitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RateLimitService rateLimitService;
    private final CaptchaService captchaService;
    private final EmailNotificationService emailService;
    private final boolean emailEnabled;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider, RateLimitService rateLimitService,
                       CaptchaService captchaService, EmailNotificationService emailService,
                       @Value("${ticketflow.email.enabled}") boolean emailEnabled) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.rateLimitService = rateLimitService;
        this.captchaService = captchaService;
        this.emailService = emailService;
        this.emailEnabled = emailEnabled;
    }

    public AuthResponse login(LoginRequest request) {
        if (isHoneypotTriggered(request.website())) {
            return fakeAuthResponse();
        }

        captchaService.validate(request.captchaToken(), request.captchaAngle());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email before signing in");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse register(RegisterRequest request, String clientIp) {
        if (isHoneypotTriggered(request.website())) {
            return fakeAuthResponse();
        }

        captchaService.validate(request.captchaToken(), request.captchaAngle());

        if (!rateLimitService.isAllowed("account:" + clientIp, 3, Duration.ofDays(1))) {
            throw new RateLimitException("Account creation limit reached");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setRole(UserRole.USER);

        if (emailEnabled) {
            user.setEmailVerified(false);
            user.setVerificationToken(UUID.randomUUID().toString());
        } else {
            user.setEmailVerified(true);
        }

        userRepository.save(user);

        if (emailEnabled && user.getVerificationToken() != null) {
            enforceEmailRateLimit(request.email());
            emailService.sendVerificationEmail(user);
        }

        return buildAuthResponse(user);
    }

    public Map<String, String> forgotPassword(ForgotPasswordRequest request, String clientIp) {
        String genericMessage = "If the email exists, a reset link has been sent";

        if (isHoneypotTriggered(request.website())) {
            return Map.of("message", genericMessage);
        }

        captchaService.validate(request.captchaToken(), request.captchaAngle());

        if (!emailEnabled) {
            throw new IllegalArgumentException("Email is not configured");
        }

        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return Map.of("message", genericMessage);
        }

        enforceEmailRateLimit(request.email());

        user.setResetToken(UUID.randomUUID().toString());
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user);

        return Map.of("message", genericMessage);
    }

    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return Map.of("message", "Password reset successfully");
    }

    public Map<String, String> verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return Map.of("message", "Email verified successfully");
    }

    public AuthResponse refresh(String refreshToken) {
        if (!tokenProvider.isValidRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        var claims = tokenProvider.parseToken(refreshToken);
        User user = userRepository.findByEmail(claims.getSubject())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    private boolean isHoneypotTriggered(String website) {
        if (website != null && !website.isBlank()) {
            log.warn("Honeypot triggered");
            return true;
        }
        return false;
    }

    private void enforceEmailRateLimit(String email) {
        if (!rateLimitService.isAllowed("email:" + email, 3, Duration.ofHours(1))) {
            throw new RateLimitException("Too many email requests");
        }
    }

    private AuthResponse fakeAuthResponse() {
        return new AuthResponse("ok", "ok", "user@example.com", "User", "USER");
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getDisplayName(), user.getRole().name());
    }
}
