package com.taskhub.service;

import com.taskhub.dto.CreateProjectRequest;
import com.taskhub.dto.MemberResponse;
import com.taskhub.dto.ProjectResponse;
import com.taskhub.dto.UpdateProjectRequest;
import com.taskhub.entity.Organization;
import com.taskhub.entity.Project;
import com.taskhub.entity.User;
import com.taskhub.exception.APIException;
import com.taskhub.exception.ResourceNotFoundException;
import com.taskhub.repository.OrganizationRepository;
import com.taskhub.repository.ProjectRepository;
import com.taskhub.repository.UserRepository;
import com.taskhub.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              OrganizationRepository organizationRepository,
                              UserRepository userRepository,
                              TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
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

    private ProjectResponse mapToResponse(Project project) {
        MemberResponse leadResponse = null;
        if (project.getProjectLead() != null) {
            leadResponse = MemberResponse.builder()
                    .userId(project.getProjectLead().getId())
                    .name(project.getProjectLead().getName())
                    .email(project.getProjectLead().getEmail())
                    .isOwner(project.getOrganization().getOwner().getId().equals(project.getProjectLead().getId()))
                    .build();
        }

        List<MemberResponse> memberResponses = project.getMembers().stream()
                .map(m -> MemberResponse.builder()
                        .userId(m.getId())
                        .name(m.getName())
                        .email(m.getEmail())
                        .isOwner(project.getOrganization().getOwner().getId().equals(m.getId()))
                        .build())
                .collect(Collectors.toList());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .organizationId(project.getOrganization().getId())
                .status(project.getStatus())
                .priority(project.getPriority())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .projectLead(leadResponse)
                .members(memberResponses)
                .taskCount((int) taskRepository.countByProjectId(project.getId()))
                .completedTaskCount((int) taskRepository.countByProjectIdAndStatus(project.getId(), com.taskhub.entity.Task.TaskStatus.DONE))
                .progressPercentage(taskRepository.countByProjectId(project.getId()) > 0
                    ? (int) (taskRepository.countByProjectIdAndStatus(project.getId(), com.taskhub.entity.Task.TaskStatus.DONE) * 100 / taskRepository.countByProjectId(project.getId()))
                    : 0)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public ProjectResponse createProject(UUID orgId, CreateProjectRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = getOrgAndVerifyAccess(orgId, currentUser);

        User lead = null;
        if (request.getProjectLeadId() != null) {
            lead = userRepository.findById(request.getProjectLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getProjectLeadId()));
            // Verify lead is in org
            if (!org.getOwner().equals(lead) && !org.getMembers().contains(lead)) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Project lead must be a member of the organization");
            }
        }

        List<User> members = List.of();
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            members = userRepository.findAllById(request.getMemberIds());
            for (User member : members) {
                if (!org.getOwner().equals(member) && !org.getMembers().contains(member)) {
                    throw new APIException(HttpStatus.BAD_REQUEST, "All project members must be members of the organization");
                }
            }
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .organization(org)
                .status(request.getStatus())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .projectLead(lead)
                .members(new HashSet<>(members))
                .build();

        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    @Override
    public List<ProjectResponse> getProjectsByOrganization(UUID orgId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = getOrgAndVerifyAccess(orgId, currentUser);

        List<Project> projects = projectRepository.findByOrganization(org);
        return projects.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectById(UUID orgId, UUID projectId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Project project = getProjectAndVerifyAccess(orgId, projectId, currentUser);
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UUID orgId, UUID projectId, UpdateProjectRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Project project = getProjectAndVerifyAccess(orgId, projectId, currentUser);
        Organization org = project.getOrganization();

        User lead = null;
        if (request.getProjectLeadId() != null) {
            lead = userRepository.findById(request.getProjectLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getProjectLeadId()));
            if (!org.getOwner().equals(lead) && !org.getMembers().contains(lead)) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Project lead must be a member of the organization");
            }
        }

        List<User> members = List.of();
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            members = userRepository.findAllById(request.getMemberIds());
            for (User member : members) {
                if (!org.getOwner().equals(member) && !org.getMembers().contains(member)) {
                    throw new APIException(HttpStatus.BAD_REQUEST, "All project members must be members of the organization");
                }
            }
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setPriority(request.getPriority());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setProjectLead(lead);
        project.setMembers(new HashSet<>(members));

        Project updated = projectRepository.save(project);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProject(UUID orgId, UUID projectId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Project project = getProjectAndVerifyAccess(orgId, projectId, currentUser);
        projectRepository.delete(project);
    }
}
