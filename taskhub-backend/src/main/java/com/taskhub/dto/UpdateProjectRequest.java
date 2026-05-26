package com.taskhub.dto;

import com.taskhub.entity.enums.ProjectPriority;
import com.taskhub.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Status is required")
    private ProjectStatus status;
    
    @NotNull(message = "Priority is required")
    private ProjectPriority priority;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @NotNull(message = "Project lead ID is required")
    private UUID projectLeadId;
    
    private List<UUID> memberIds;
}
