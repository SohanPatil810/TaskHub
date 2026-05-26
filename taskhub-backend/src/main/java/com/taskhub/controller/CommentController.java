package com.taskhub.controller;

import com.taskhub.dto.CommentRequest;
import com.taskhub.dto.CommentResponse;
import com.taskhub.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{orgId}/projects/{projectId}/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.addComment(orgId, projectId, taskId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByTask(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.getCommentsByTask(orgId, projectId, taskId, authentication.getName()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            Authentication authentication) {
        commentService.deleteComment(orgId, projectId, taskId, commentId, authentication.getName());
        return ResponseEntity.ok("Comment deleted successfully");
    }
}
