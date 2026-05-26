package com.taskhub.service;

import com.taskhub.dto.CreateTaskRequest;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.UpdateTaskRequest;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskResponse createTask(UUID orgId, UUID projectId, CreateTaskRequest request, String currentUserEmail);
    List<TaskResponse> getTasksByProject(UUID orgId, UUID projectId, String currentUserEmail);
    TaskResponse getTaskById(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail);
    TaskResponse updateTask(UUID orgId, UUID projectId, UUID taskId, UpdateTaskRequest request, String currentUserEmail);
    void deleteTask(UUID orgId, UUID projectId, UUID taskId, String currentUserEmail);
}
