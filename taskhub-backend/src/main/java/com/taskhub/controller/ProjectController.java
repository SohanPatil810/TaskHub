package com.taskhub.controller;

import com.taskhub.dto.CreateProjectRequest;
import com.taskhub.dto.ProjectResponse;
import com.taskhub.dto.UpdateProjectRequest;
import com.taskhub.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{orgId}/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @PathVariable UUID orgId,
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        ProjectResponse response = projectService.createProject(orgId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjectsByOrganization(
            @PathVariable UUID orgId,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.getProjectsByOrganization(orgId, authentication.getName()));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.getProjectById(orgId, projectId, authentication.getName()));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.updateProject(orgId, projectId, request, authentication.getName()));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<String> deleteProject(
            @PathVariable UUID orgId,
            @PathVariable UUID projectId,
            Authentication authentication) {
        projectService.deleteProject(orgId, projectId, authentication.getName());
        return ResponseEntity.ok("Project deleted successfully");
    }
}
