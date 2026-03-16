package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.Ticket;
import com.davnstech.ticketflow.domain.TicketComment;
import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.dto.CommentResponse;
import com.davnstech.ticketflow.dto.CreateCommentRequest;
import com.davnstech.ticketflow.repository.TicketCommentRepository;
import com.davnstech.ticketflow.repository.TicketRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    public CommentService(TicketCommentRepository commentRepository, TicketRepository ticketRepository,
                          UserRepository userRepository, EmailNotificationService emailService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CreateCommentRequest request, Long authorId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(request.content());
        comment.setInternal(request.internal());

        TicketComment saved = commentRepository.save(comment);
        emailService.notifyNewComment(saved);
        return CommentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long ticketId, boolean includeInternal) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new IllegalArgumentException("Ticket not found");
        }

        var comments = includeInternal
                ? commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                : commentRepository.findByTicketIdAndInternalFalseOrderByCreatedAtAsc(ticketId);

        return comments.stream().map(CommentResponse::from).toList();
    }
}
