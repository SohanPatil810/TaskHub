package com.taskhub.dto;

import com.taskhub.entity.enums.ProjectPriority;
import com.taskhub.entity.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID organizationId;
    
    private ProjectStatus status;
    private ProjectPriority priority;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    private MemberResponse projectLead;
    private List<MemberResponse> members;
    
    private int taskCount;
    private int completedTaskCount;
    private int progressPercentage;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
