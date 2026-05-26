package com.taskhub.service;

import com.taskhub.dto.CreateTaskRequest;
import com.taskhub.dto.MemberResponse;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.UpdateTaskRequest;
import com.taskhub.entity.Organization;
import com.taskhub.entity.Project;
import com.taskhub.entity.Task;
import com.taskhub.entity.User;
import com.taskhub.exception.APIException;
import com.taskhub.exception.ResourceNotFoundException;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository,
                           ProjectRepository projectRepository,
                           OrganizationRepository organizationRepository,
                           UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Organization getOrgAndVerifyAccess(UUID orgId, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));
        boolean isMember = org.getOwner().equals(user) || org.getMembers().contains(user);
        if (!isMember) {
            throw new APIException(HttpStatus.FORBIDDEN, "You are not a member of this organization");
        }
        return org;
    }

    private Project getProjectAndVerifyAccess(UUID orgId, UUID projectId, User user) {
        Organization org = getOrgAndVerifyAccess(orgId, user);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        
        if (!project.getOrganization().getId().equals(orgId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Project does not belong to this organization");
        }
        return project;
    }

    private Task getTaskAndVerifyAccess(UUID orgId, UUID projectId, UUID taskId, User user) {
        Project project = getProjectAndVerifyAccess(orgId, projectId, user);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        
        if (!task.getProject().getId().equals(projectId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Task does not belong to this project");
        }
        return task;
    }

    private TaskResponse mapToResponse(Task task) {
        MemberResponse assigneeResponse = null;
        if (task.getAssignee() != null) {
            assigneeResponse = MemberResponse.builder()
                    .userId(task.getAssignee().getId())
                    .name(task.getAssignee().getName())
                    .email(task.getAssignee().getEmail())
                    .isOwner(task.getProject().getOrganization().getOwner().getId().equals(task.getAssignee().getId()))
                    .build();
        }

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .type(task.getType())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignee(assigneeResponse)
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public TaskResponse createTask(UUID orgId, UUID projectId, CreateTaskRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Project project = getProjectAndVerifyAccess(orgId, projectId, currentUser);
        Organization org = project.getOrganization();

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            // Verify assignee is in org
            if (!org.getOwner().equals(assignee) && !org.getMembers().contains(assignee)) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Assignee must be a member of the organization");
            }
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .type(request.getType())
                .project(project)
                .assignee(assignee)
                .dueDate(request.getDueDate())
                .build();

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Override
    public List<TaskResponse> getTasksByProject(UUID orgId, UUID projectId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        getProjectAndVerifyAccess(orgId, projectId, currentUser);

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TaskResponse getTaskById(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Task task = getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID orgId, UUID projectId, UUID taskId, UpdateTaskRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Task task = getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);
        Organization org = task.getProject().getOrganization();

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            if (!org.getOwner().equals(assignee) && !org.getMembers().contains(assignee)) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Assignee must be a member of the organization");
            }
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setType(request.getType());
        task.setAssignee(assignee);
        task.setDueDate(request.getDueDate());

        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTask(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Task task = getTaskAndVerifyAccess(orgId, projectId, taskId, currentUser);
        taskRepository.delete(task);
    }
}
