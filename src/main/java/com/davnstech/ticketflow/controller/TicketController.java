package com.davnstech.ticketflow.controller;

import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;
import com.davnstech.ticketflow.dto.*;
import com.davnstech.ticketflow.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ticketService.create(request, userId));
    }

    @GetMapping
    public ResponseEntity<TicketListResponse> list(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            Authentication auth) {

        Long userId = (Long) auth.getPrincipal();
        Long requesterId = hasRole(auth, "ROLE_USER") ? userId : null;
        var filters = new TicketFilters(status, priority, assigneeId, requesterId);
        var pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ResponseEntity.ok(ticketService.list(filters, pageable));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> findById(@PathVariable Long ticketId, Authentication auth) {
        TicketResponse ticket = ticketService.findById(ticketId);
        verifyAccess(auth, ticket);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> update(@PathVariable Long ticketId, @Valid @RequestBody UpdateTicketRequest request, Authentication auth) {
        TicketResponse ticket = ticketService.findById(ticketId);
        verifyAccess(auth, ticket);
        return ResponseEntity.ok(ticketService.update(ticketId, request));
    }

    @DeleteMapping("/{ticketId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long ticketId) {
        ticketService.delete(ticketId);
        return ResponseEntity.noContent().build();
    }

    private void verifyAccess(Authentication auth, TicketResponse ticket) {
        if (hasRole(auth, "ROLE_ADMIN")) return;

        Long userId = (Long) auth.getPrincipal();
        if (hasRole(auth, "ROLE_AGENT")) {
            if (ticket.assigneeId() != null && ticket.assigneeId().equals(userId)) return;
            if (ticket.assigneeId() == null) return;
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (!ticket.requesterId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }
}
