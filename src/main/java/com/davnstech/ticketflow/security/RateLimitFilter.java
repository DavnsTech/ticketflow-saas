package com.davnstech.ticketflow.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!"POST".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        RateLimitRule rule = resolveRule(path);

        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }

        String key = rule.prefix + ":" + clientIp;
        if (!rateLimitService.isAllowed(key, rule.maxRequests, rule.window)) {
            rejectWithTooManyRequests(response, rule.window);
            return;
        }

        chain.doFilter(request, response);
    }

    private RateLimitRule resolveRule(String path) {
        if (path.equals("/api/auth/login")) {
            return new RateLimitRule("login", 10, Duration.ofMinutes(1));
        }
        if (path.equals("/api/auth/register")) {
            return new RateLimitRule("register", 5, Duration.ofHours(1));
        }
        if (path.equals("/api/auth/forgot-password")) {
            return new RateLimitRule("forgot", 3, Duration.ofHours(1));
        }
        return null;
    }

    private void rejectWithTooManyRequests(HttpServletResponse response, Duration retryAfter) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(retryAfter.toSeconds()));
        objectMapper.writeValue(response.getOutputStream(), Map.of("error", "Too many requests"));
    }

    public static String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitRule(String prefix, int maxRequests, Duration window) {}
}
