package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationResponse {
    private UUID id;
    private String email;
    private String organizationName;
    private UUID organizationId;
    private String role;
    private String status; // PENDING, ACCEPTED, EXPIRED
    private String token;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private String invitedByName;
    private String invitedByEmail;
    private boolean userExists;
}
