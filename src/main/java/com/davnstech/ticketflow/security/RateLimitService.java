package com.davnstech.ticketflow.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitService {

    private final Map<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxRequests, Duration window) {
        long now = System.currentTimeMillis();
        long windowStart = now - window.toMillis();

        Deque<Long> timestamps = requestLog.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        evictBefore(timestamps, windowStart);

        if (timestamps.size() >= maxRequests) {
            return false;
        }

        timestamps.addLast(now);
        return true;
    }

    public int remaining(String key, int maxRequests, Duration window) {
        long windowStart = System.currentTimeMillis() - window.toMillis();
        Deque<Long> timestamps = requestLog.get(key);
        if (timestamps == null) {
            return maxRequests;
        }
        evictBefore(timestamps, windowStart);
        return Math.max(0, maxRequests - timestamps.size());
    }

    @Scheduled(fixedRate = 60_000)
    public void cleanup() {
        long fiveMinutesAgo = System.currentTimeMillis() - Duration.ofMinutes(5).toMillis();
        Iterator<Map.Entry<String, Deque<Long>>> iterator = requestLog.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Deque<Long>> entry = iterator.next();
            evictBefore(entry.getValue(), fiveMinutesAgo);
            if (entry.getValue().isEmpty()) {
                iterator.remove();
            }
        }
    }

    private void evictBefore(Deque<Long> timestamps, long cutoff) {
        while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
            timestamps.pollFirst();
        }
    }
}
