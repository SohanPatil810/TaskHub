package com.taskhub.service;

import com.taskhub.dto.CommentRequest;
import com.taskhub.dto.CommentResponse;
import com.taskhub.dto.MemberResponse;
import com.taskhub.entity.Comment;
import com.taskhub.entity.Project;
import com.taskhub.entity.Task;
import com.taskhub.entity.User;
import com.taskhub.exception.APIException;
import com.taskhub.exception.ResourceNotFoundException;
import com.taskhub.repository.CommentRepository;
import com.taskhub.repository.OrganizationRepository;
import com.taskhub.repository.ProjectRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public CommentServiceImpl(CommentRepository commentRepository,
                              TaskRepository taskRepository,
                              ProjectRepository projectRepository,
                              OrganizationRepository organizationRepository,
                              UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Project getProjectAndVerifyAccess(UUID orgId, UUID projectId, User user) {
        organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        
        if (!project.getOrganization().getId().equals(orgId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Project does not belong to this organization");
        }
        
        boolean isMember = project.getOrganization().getOwner().equals(user) || project.getOrganization().getMembers().contains(user);
        if (!isMember) {
            throw new APIException(HttpStatus.FORBIDDEN, "You are not a member of this organization");
        }
        return project;
    }

    private Task getTaskAndVerifyAccess(UUID orgId, UUID projectId, UUID taskId, User user) {
        getProjectAndVerifyAccess(orgId, projectId, user);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        
        if (!task.getProject().getId().equals(projectId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Task does not belong to this project");
        }
        return task;
    }

    private CommentResponse mapToResponse(Comment comment) {
        MemberResponse userResponse = MemberResponse.builder()
                .userId(comment.getUser().getId())
                .name(comment.getUser().getName())
                .email(comment.getUser().getEmail())
                .isOwner(comment.getTask().getProject().getOrganization().getOwner().getId().equals(comment.getUser().getId()))
                .build();

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .taskId(comment.getTask().getId())
                .user(userResponse)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public CommentResponse addComment(UUID orgId, UUID projectId, UUID taskId, CommentRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Task task = getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .user(currentUser)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Override
    public List<CommentResponse> getCommentsByTask(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);

        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        return comments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(UUID orgId, UUID projectId, UUID taskId, UUID commentId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getTask().getId().equals(taskId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Comment does not belong to this task");
        }

        // Only comment author or project lead or organization owner can delete comments
        boolean isAuthor = comment.getUser().equals(currentUser);
        boolean isLead = comment.getTask().getProject().getProjectLead() != null && comment.getTask().getProject().getProjectLead().equals(currentUser);
        boolean isOwner = comment.getTask().getProject().getOrganization().getOwner().equals(currentUser);

        if (!isAuthor && !isLead && !isOwner) {
            throw new APIException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
