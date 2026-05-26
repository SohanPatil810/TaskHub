package com.taskhub.service;

import com.taskhub.dto.InvitationRequest;
import com.taskhub.dto.InvitationResponse;
import java.util.List;
import java.util.UUID;

public interface InvitationService {
    InvitationResponse inviteMember(UUID orgId, InvitationRequest request, String currentUserEmail);
    InvitationResponse validateToken(String token);
    InvitationResponse acceptInvitation(String token, String currentUserEmail);
    void autoAcceptPendingInvitations(String userEmail);
    List<InvitationResponse> getPendingInvitations(UUID orgId, String currentUserEmail);
    InvitationResponse resendInvitation(UUID orgId, UUID invitationId, String currentUserEmail);
    void cancelInvitation(UUID orgId, UUID invitationId, String currentUserEmail);
}
