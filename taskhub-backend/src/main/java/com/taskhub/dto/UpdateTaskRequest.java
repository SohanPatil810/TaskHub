package com.taskhub.dto;

import com.taskhub.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Status is required")
    private Task.TaskStatus status;
    
    @NotNull(message = "Priority is required")
    private Task.TaskPriority priority;
    
    @NotNull(message = "Type is required")
    private Task.TaskType type;
    
    private UUID assigneeId;
    
    private LocalDateTime dueDate;
}
