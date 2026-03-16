package com.davnstech.ticketflow.controller;

import com.davnstech.ticketflow.dto.CommentResponse;
import com.davnstech.ticketflow.dto.CreateCommentRequest;
import com.davnstech.ticketflow.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(commentService.addComment(ticketId, request, userId));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> listComments(
            @PathVariable Long ticketId,
            Authentication auth) {
        boolean includeInternal = !isUser(auth);
        return ResponseEntity.ok(commentService.listComments(ticketId, includeInternal));
    }

    private boolean isUser(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
    }
}
