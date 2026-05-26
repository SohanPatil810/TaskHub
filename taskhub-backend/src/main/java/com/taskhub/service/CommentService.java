package com.taskhub.service;

import com.taskhub.dto.CommentRequest;
import com.taskhub.dto.CommentResponse;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponse addComment(UUID orgId, UUID projectId, UUID taskId, CommentRequest request, String currentUserEmail);
    List<CommentResponse> getCommentsByTask(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail);
    void deleteComment(UUID orgId, UUID projectId, UUID taskId, UUID commentId, String currentUserEmail);
}
