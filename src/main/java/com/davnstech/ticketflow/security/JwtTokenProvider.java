package com.davnstech.ticketflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${ticketflow.jwt.secret}") String secret,
            @Value("${ticketflow.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${ticketflow.jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Long userId, String email, String role) {
        return buildToken(userId, email, role, ACCESS_TYPE, accessTokenExpiration);
    }

    public String generateRefreshToken(Long userId, String email, String role) {
        return buildToken(userId, email, role, REFRESH_TYPE, refreshTokenExpiration);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValidAccessToken(String token) {
        return isTokenOfType(token, ACCESS_TYPE);
    }

    public boolean isValidRefreshToken(String token) {
        return isTokenOfType(token, REFRESH_TYPE);
    }

    private boolean isTokenOfType(String token, String expectedType) {
        try {
            Claims claims = parseToken(token);
            return expectedType.equals(claims.get(TOKEN_TYPE_CLAIM, String.class));
        } catch (Exception exception) {
            return false;
        }
    }

    private String buildToken(Long userId, String email, String role, String type, long expiration) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim(TOKEN_TYPE_CLAIM, type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiration))
                .signWith(signingKey)
                .compact();
    }
}
