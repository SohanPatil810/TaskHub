package com.taskhub.controller;

import com.taskhub.dto.InvitationRequest;
import com.taskhub.dto.InvitationResponse;
import com.taskhub.service.InvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/organizations/{orgId}/invitations")
    public ResponseEntity<InvitationResponse> inviteMember(
            @PathVariable UUID orgId,
            @RequestBody InvitationRequest request,
            Principal principal) {
        InvitationResponse response = invitationService.inviteMember(orgId, request, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/organizations/{orgId}/invitations/pending")
    public ResponseEntity<List<InvitationResponse>> getPendingInvitations(
            @PathVariable UUID orgId,
            Principal principal) {
        return ResponseEntity.ok(invitationService.getPendingInvitations(orgId, principal.getName()));
    }

    @PostMapping("/organizations/{orgId}/invitations/{invitationId}/resend")
    public ResponseEntity<InvitationResponse> resendInvitation(
            @PathVariable UUID orgId,
            @PathVariable UUID invitationId,
            Principal principal) {
        return ResponseEntity.ok(invitationService.resendInvitation(orgId, invitationId, principal.getName()));
    }

    @DeleteMapping("/organizations/{orgId}/invitations/{invitationId}")
    public ResponseEntity<String> cancelInvitation(
            @PathVariable UUID orgId,
            @PathVariable UUID invitationId,
            Principal principal) {
        invitationService.cancelInvitation(orgId, invitationId, principal.getName());
        return ResponseEntity.ok("Invitation cancelled successfully");
    }

    @GetMapping("/invitations/validate")
    public ResponseEntity<InvitationResponse> validateToken(@RequestParam String token) {
        InvitationResponse response = invitationService.validateToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invitations/accept")
    public ResponseEntity<InvitationResponse> acceptInvitation(
            @RequestParam String token,
            Principal principal) {
        InvitationResponse response = invitationService.acceptInvitation(token, principal.getName());
        return ResponseEntity.ok(response);
    }
}
