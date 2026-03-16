package com.davnstech.ticketflow.dto;

import com.davnstech.ticketflow.domain.TicketComment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String content,
        boolean internal,
        String authorName,
        Long authorId,
        LocalDateTime createdAt) {

    public static CommentResponse from(TicketComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.isInternal(),
                comment.getAuthor().getDisplayName(),
                comment.getAuthor().getId(),
                comment.getCreatedAt());
    }
}
