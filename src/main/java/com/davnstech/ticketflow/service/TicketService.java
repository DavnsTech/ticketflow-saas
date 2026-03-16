package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.*;
import com.davnstech.ticketflow.dto.*;
import com.davnstech.ticketflow.repository.TicketRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, EmailNotificationService emailService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest request, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority() != null ? request.priority() : TicketPriority.MEDIUM);
        ticket.setCategory(request.category());
        ticket.setRequester(requester);

        if (request.tags() != null) {
            ticket.setTags(request.tags());
        }

        Ticket saved = ticketRepository.save(ticket);
        emailService.notifyTicketCreated(saved);
        return TicketResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public TicketListResponse list(TicketFilters filters, Pageable pageable) {
        Page<Ticket> page = ticketRepository.findWithFilters(
                filters.status(), filters.priority(), filters.assigneeId(), filters.requesterId(), pageable);
        return new TicketListResponse(
                page.getContent().stream().map(TicketResponse::from).toList(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        return TicketResponse.from(ticket);
    }

    @Transactional
    public TicketResponse update(Long ticketId, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (request.title() != null) ticket.setTitle(request.title());
        if (request.description() != null) ticket.setDescription(request.description());
        if (request.priority() != null) ticket.setPriority(request.priority());
        if (request.category() != null) ticket.setCategory(request.category());
        if (request.tags() != null) ticket.setTags(request.tags());

        boolean assigneeChanged = false;
        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));
            ticket.setAssignee(assignee);
            assigneeChanged = true;
        }

        if (request.status() != null) {
            ticket.setStatus(request.status());
            if (request.status() == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        Ticket saved = ticketRepository.save(ticket);
        if (assigneeChanged) {
            emailService.notifyTicketAssigned(saved);
        }
        return TicketResponse.from(saved);
    }

    @Transactional
    public void delete(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new IllegalArgumentException("Ticket not found");
        }
        ticketRepository.deleteById(ticketId);
    }
}
