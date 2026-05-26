package com.taskhub.service;

import com.taskhub.dto.CreateOrganizationRequest;
import com.taskhub.dto.MemberResponse;
import com.taskhub.dto.OrganizationResponse;
import com.taskhub.entity.Organization;
import com.taskhub.entity.User;
import com.taskhub.exception.APIException;
import com.taskhub.exception.ResourceNotFoundException;
import com.taskhub.repository.OrganizationMemberRoleRepository;
import com.taskhub.repository.OrganizationRepository;
import com.taskhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRoleRepository memberRoleRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                   UserRepository userRepository,
                                   OrganizationMemberRoleRepository memberRoleRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.memberRoleRepository = memberRoleRepository;
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

    private OrganizationResponse mapToResponse(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .ownerEmail(org.getOwner().getEmail())
                .memberCount(org.getMembers().size() + 1) // +1 for owner
                .createdAt(org.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, String currentUserEmail) {
        User owner = getUser(currentUserEmail);
        Organization org = Organization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();
        Organization saved = organizationRepository.save(org);
        return mapToResponse(saved);
    }

    @Override
    public List<OrganizationResponse> getMyOrganizations(String currentUserEmail) {
        User user = getUser(currentUserEmail);
        return organizationRepository.findAllByUserMembership(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrganizationResponse getOrganizationById(UUID orgId, String currentUserEmail) {
        User user = getUser(currentUserEmail);
        Organization org = getOrgAndVerifyAccess(orgId, user);
        return mapToResponse(org);
    }

    @Override
    public List<MemberResponse> getOrganizationMembers(UUID orgId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = getOrgAndVerifyAccess(orgId, currentUser);

        List<MemberResponse> members = org.getMembers().stream()
                .map(u -> {
                    String role = memberRoleRepository.findByOrganizationIdAndUserId(orgId, u.getId())
                            .map(r -> r.getRole().name())
                            .orElse("MEMBER");
                    return MemberResponse.builder()
                            .userId(u.getId())
                            .name(u.getName())
                            .email(u.getEmail())
                            .isOwner(false)
                            .role(role)
                            .build();
                })
                .collect(Collectors.toList());

        // Add owner at the top
        members.add(0, MemberResponse.builder()
                .userId(org.getOwner().getId())
                .name(org.getOwner().getName())
                .email(org.getOwner().getEmail())
                .isOwner(true)
                .role("OWNER")
                .build());

        return members;
    }

    @Override
    @Transactional
    public void addMember(UUID orgId, String memberEmail, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        if (!org.getOwner().equals(currentUser)) {
            throw new APIException(HttpStatus.FORBIDDEN, "Only the owner can add members");
        }

        User newMember = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", memberEmail));

        if (org.getMembers().contains(newMember) || org.getOwner().equals(newMember)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "User is already a member of this organization");
        }

        org.getMembers().add(newMember);
        organizationRepository.save(org);
    }

    @Override
    @Transactional
    public void removeMember(UUID orgId, UUID memberId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        if (!org.getOwner().equals(currentUser)) {
            throw new APIException(HttpStatus.FORBIDDEN, "Only the owner can remove members");
        }

        User memberToRemove = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));

        org.getMembers().remove(memberToRemove);
        organizationRepository.save(org);
    }
}
