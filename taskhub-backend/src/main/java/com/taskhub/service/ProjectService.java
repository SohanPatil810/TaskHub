package com.taskhub.service;

import com.taskhub.dto.CreateProjectRequest;
import com.taskhub.dto.ProjectResponse;
import com.taskhub.dto.UpdateProjectRequest;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectResponse createProject(UUID orgId, CreateProjectRequest request, String currentUserEmail);
    List<ProjectResponse> getProjectsByOrganization(UUID orgId, String currentUserEmail);
    ProjectResponse getProjectById(UUID orgId, UUID projectId, String currentUserEmail);
    ProjectResponse updateProject(UUID orgId, UUID projectId, UpdateProjectRequest request, String currentUserEmail);
    void deleteProject(UUID orgId, UUID projectId, String currentUserEmail);
}
