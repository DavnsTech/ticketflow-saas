package com.davnstech.ticketflow.controller;

import com.davnstech.ticketflow.dto.AgentStats;
import com.davnstech.ticketflow.dto.DashboardStats;
import com.davnstech.ticketflow.dto.PriorityCount;
import com.davnstech.ticketflow.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/by-priority")
    public ResponseEntity<List<PriorityCount>> getByPriority() {
        return ResponseEntity.ok(dashboardService.getByPriority());
    }

    @GetMapping("/by-agent")
    public ResponseEntity<List<AgentStats>> getByAgent() {
        return ResponseEntity.ok(dashboardService.getByAgent());
    }
}
