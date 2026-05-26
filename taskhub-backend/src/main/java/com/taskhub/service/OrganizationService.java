package com.taskhub.service;

import com.taskhub.dto.CreateOrganizationRequest;
import com.taskhub.dto.MemberResponse;
import com.taskhub.dto.OrganizationResponse;

import java.util.List;
import java.util.UUID;

public interface OrganizationService {
    OrganizationResponse createOrganization(CreateOrganizationRequest request, String currentUserEmail);
    List<OrganizationResponse> getMyOrganizations(String currentUserEmail);
    OrganizationResponse getOrganizationById(UUID orgId, String currentUserEmail);
    List<MemberResponse> getOrganizationMembers(UUID orgId, String currentUserEmail);
    void addMember(UUID orgId, String memberEmail, String currentUserEmail);
    void removeMember(UUID orgId, UUID memberId, String currentUserEmail);
}
