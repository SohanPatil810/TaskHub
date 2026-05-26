package com.taskhub.controller;

import com.taskhub.dto.CreateTaskRequest;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.UpdateTaskRequest;
import com.taskhub.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{orgId}/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        TaskResponse response = taskService.createTask(orgId, projectId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasksByProject(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getTasksByProject(orgId, projectId, authentication.getName()));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskById(orgId, projectId, taskId, authentication.getName()));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.updateTask(orgId, projectId, taskId, request, authentication.getName()));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            Authentication authentication) {
        taskService.deleteTask(orgId, projectId, taskId, authentication.getName());
        return ResponseEntity.ok("Task deleted successfully");
    }
}
