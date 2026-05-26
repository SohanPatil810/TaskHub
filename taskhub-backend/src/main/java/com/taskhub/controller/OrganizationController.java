package com.taskhub.controller;

import com.taskhub.dto.CreateOrganizationRequest;
import com.taskhub.dto.MemberResponse;
import com.taskhub.dto.OrganizationResponse;
import com.taskhub.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    // Create a new organization (current user becomes owner)
    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            Authentication authentication) {
        OrganizationResponse response = organizationService.createOrganization(
                request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get all organizations the current user belongs to
    @GetMapping("/my")
    public ResponseEntity<List<OrganizationResponse>> getMyOrganizations(Authentication authentication) {
        return ResponseEntity.ok(organizationService.getMyOrganizations(authentication.getName()));
    }

    // Get one organization by ID
    @GetMapping("/{orgId}")
    public ResponseEntity<OrganizationResponse> getOrganizationById(
            @PathVariable UUID orgId,
            Authentication authentication) {
        return ResponseEntity.ok(organizationService.getOrganizationById(orgId, authentication.getName()));
    }

    // Get members of an organization
    @GetMapping("/{orgId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @PathVariable UUID orgId,
            Authentication authentication) {
        return ResponseEntity.ok(organizationService.getOrganizationMembers(orgId, authentication.getName()));
    }

    // Add a member by email
    @PostMapping("/{orgId}/members")
    public ResponseEntity<String> addMember(
            @PathVariable UUID orgId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        organizationService.addMember(orgId, body.get("email"), authentication.getName());
        return ResponseEntity.ok("Member added successfully");
    }

    // Remove a member by userId
    @DeleteMapping("/{orgId}/members/{memberId}")
    public ResponseEntity<String> removeMember(
            @PathVariable UUID orgId,
            @PathVariable UUID memberId,
            Authentication authentication) {
        organizationService.removeMember(orgId, memberId, authentication.getName());
        return ResponseEntity.ok("Member removed successfully");
    }
}
