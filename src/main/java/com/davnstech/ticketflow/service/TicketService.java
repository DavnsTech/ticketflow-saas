package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.*;
import com.davnstech.ticketflow.dto.*;
import com.davnstech.ticketflow.repository.CategoryRepository;
import com.davnstech.ticketflow.repository.CustomFieldRepository;
import com.davnstech.ticketflow.repository.TicketCustomValueRepository;
import com.davnstech.ticketflow.repository.TicketRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CustomFieldRepository customFieldRepository;
    private final TicketCustomValueRepository customValueRepository;
    private final EmailNotificationService emailService;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         CategoryRepository categoryRepository, CustomFieldRepository customFieldRepository,
                         TicketCustomValueRepository customValueRepository, EmailNotificationService emailService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.customFieldRepository = customFieldRepository;
        this.customValueRepository = customValueRepository;
        this.emailService = emailService;
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest request, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority() != null ? request.priority() : TicketPriority.MEDIUM);
        ticket.setCategory(category.getName());
        ticket.setCategoryEntity(category);
        ticket.setRequester(requester);

        if (request.tags() != null) {
            ticket.setTags(request.tags());
        }

        Ticket saved = ticketRepository.save(ticket);
        saveCustomFieldValues(saved, category.getId(), request.customFieldValues());
        emailService.notifyTicketCreated(saved);
        return TicketResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public TicketListResponse list(TicketFilters filters, Pageable pageable) {
        Page<Ticket> page = ticketRepository.findWithFilters(
                filters.status(), filters.priority(), filters.assigneeId(),
                filters.requesterId(), filters.categoryId(), filters.agentCategoryIds(),
                pageable);
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
        if (request.tags() != null) ticket.setTags(request.tags());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            ticket.setCategoryEntity(category);
            ticket.setCategory(category.getName());
        }

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

    private void saveCustomFieldValues(Ticket ticket, Long categoryId, Map<Long, String> values) {
        if (values == null || values.isEmpty()) return;

        List<CustomField> fields = customFieldRepository.findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(categoryId);

        for (CustomField field : fields) {
            String value = values.get(field.getId());
            if (field.isRequired() && (value == null || value.isBlank())) {
                throw new IllegalArgumentException("Field '" + field.getLabel() + "' is required");
            }
            if (value != null && !value.isBlank()) {
                TicketCustomValue customValue = new TicketCustomValue();
                customValue.setTicket(ticket);
                customValue.setCustomField(field);
                customValue.setValue(value);
                customValueRepository.save(customValue);
                ticket.getCustomValues().add(customValue);
            }
        }
    }
}
