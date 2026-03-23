package com.davnstech.ticketflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import javax.imageio.ImageIO;

@Service
public class CaptchaService {

    private static final int IMAGE_SIZE = 200;
    private static final int ANGLE_TOLERANCE = 15;
    private static final long TOKEN_VALIDITY_MS = 5 * 60 * 1000;
    private static final int ANGLE_STEP = 30;

    private final byte[] secretKey;

    public CaptchaService(@Value("${ticketflow.jwt.secret}") String secret) {
        this.secretKey = secret.getBytes(StandardCharsets.UTF_8);
    }

    public Map<String, String> generateChallenge() {
        int correctAngle = randomAngle();
        BufferedImage image = renderRotatedArrow(correctAngle);
        String imageBase64 = encodeImageToBase64(image);
        long expiry = System.currentTimeMillis() + TOKEN_VALIDITY_MS;
        String token = buildToken(correctAngle, expiry);

        return Map.of(
                "image", "data:image/png;base64," + imageBase64,
                "token", token
        );
    }

    public void validate(String token, Integer userAngle) {
        if (token == null || token.isBlank() || userAngle == null) {
            throw new IllegalArgumentException("Captcha is required");
        }

        String[] parts = token.split("\\|");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid captcha");
        }

        int correctAngle;
        long expiry;
        try {
            correctAngle = Integer.parseInt(parts[0]);
            expiry = Long.parseLong(parts[1]);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid captcha");
        }

        if (System.currentTimeMillis() > expiry) {
            throw new IllegalArgumentException("Captcha expired");
        }

        String expectedHmac = computeHmac(correctAngle + ":" + expiry);
        if (!expectedHmac.equals(parts[2])) {
            throw new IllegalArgumentException("Invalid captcha");
        }

        int diff = Math.abs(normalizeAngle(userAngle) - correctAngle);
        int circularDiff = Math.min(diff, 360 - diff);
        if (circularDiff > ANGLE_TOLERANCE) {
            throw new IllegalArgumentException("Incorrect captcha answer");
        }
    }

    private int randomAngle() {
        int steps = ThreadLocalRandom.current().nextInt(1, 360 / ANGLE_STEP);
        return steps * ANGLE_STEP;
    }

    private int normalizeAngle(int angle) {
        int normalized = angle % 360;
        return normalized < 0 ? normalized + 360 : normalized;
    }

    private BufferedImage renderRotatedArrow(int angleDegrees) {
        BufferedImage image = new BufferedImage(IMAGE_SIZE, IMAGE_SIZE, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = image.createGraphics();

        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.setColor(new Color(245, 245, 250));
        graphics.fillOval(0, 0, IMAGE_SIZE, IMAGE_SIZE);

        graphics.setColor(new Color(200, 200, 210));
        graphics.setStroke(new BasicStroke(2));
        graphics.drawOval(1, 1, IMAGE_SIZE - 3, IMAGE_SIZE - 3);

        AffineTransform original = graphics.getTransform();
        graphics.rotate(Math.toRadians(angleDegrees), IMAGE_SIZE / 2.0, IMAGE_SIZE / 2.0);

        int cx = IMAGE_SIZE / 2;
        int cy = IMAGE_SIZE / 2;

        // Arrow body
        graphics.setColor(new Color(79, 70, 229));
        graphics.setStroke(new BasicStroke(6, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        graphics.drawLine(cx, cy + 50, cx, cy - 40);

        // Arrow head
        int[] xPoints = {cx, cx - 20, cx + 20};
        int[] yPoints = {cy - 60, cy - 30, cy - 30};
        graphics.fillPolygon(xPoints, yPoints, 3);

        // Small dot at center
        graphics.setColor(new Color(79, 70, 229, 100));
        graphics.fillOval(cx - 4, cy - 4, 8, 8);

        graphics.setTransform(original);
        graphics.dispose();
        return image;
    }

    private String encodeImageToBase64(BufferedImage image) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ImageIO.write(image, "PNG", output);
            return Base64.getEncoder().encodeToString(output.toByteArray());
        } catch (IOException exception) {
            throw new RuntimeException("Failed to encode captcha image", exception);
        }
    }

    private String buildToken(int angle, long expiry) {
        String hmac = computeHmac(angle + ":" + expiry);
        return angle + "|" + expiry + "|" + hmac;
    }

    private String computeHmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception exception) {
            throw new RuntimeException("HMAC computation failed", exception);
        }
    }
}
