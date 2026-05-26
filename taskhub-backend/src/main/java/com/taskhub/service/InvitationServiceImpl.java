package com.taskhub.service;

import com.taskhub.dto.InvitationRequest;
import com.taskhub.dto.InvitationResponse;
import com.taskhub.entity.Invitation;
import com.taskhub.entity.Organization;
import com.taskhub.entity.OrganizationMemberRole;
import com.taskhub.entity.User;
import com.taskhub.exception.APIException;
import com.taskhub.exception.ResourceNotFoundException;
import com.taskhub.repository.InvitationRepository;
import com.taskhub.repository.OrganizationMemberRoleRepository;
import com.taskhub.repository.OrganizationRepository;
import com.taskhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRoleRepository memberRoleRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public InvitationServiceImpl(InvitationRepository invitationRepository,
                                 OrganizationRepository organizationRepository,
                                 UserRepository userRepository,
                                 OrganizationMemberRoleRepository memberRoleRepository,
                                 EmailService emailService,
                                 PasswordEncoder passwordEncoder) {
        this.invitationRepository = invitationRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.memberRoleRepository = memberRoleRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Invitation.InvitationRole parseRole(String roleStr) {
        try {
            return Invitation.InvitationRole.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Invalid role. Must be ADMIN, MANAGER, or MEMBER");
        }
    }

    private InvitationResponse mapToResponse(Invitation invite) {
        boolean userExists = userRepository.existsByEmail(invite.getEmail());
        return InvitationResponse.builder()
                .id(invite.getId())
                .email(invite.getEmail())
                .organizationName(invite.getOrganization().getName())
                .organizationId(invite.getOrganization().getId())
                .role(invite.getRole().name())
                .status(invite.getStatus().name())
                .token(invite.getToken())
                .expiresAt(invite.getExpiresAt())
                .createdAt(invite.getCreatedAt())
                .acceptedAt(invite.getAcceptedAt())
                .invitedByName(invite.getInvitedBy() != null ? invite.getInvitedBy().getName() : null)
                .invitedByEmail(invite.getInvitedBy() != null ? invite.getInvitedBy().getEmail() : null)
                .userExists(userExists)
                .build();
    }

    private void verifyOrgAdmin(Organization org, User user) {
        boolean isAdmin = org.getOwner().equals(user);
        if (!isAdmin) {
            Optional<OrganizationMemberRole> memberRole = memberRoleRepository.findByOrganizationIdAndUserId(org.getId(), user.getId());
            if (memberRole.isPresent() && memberRole.get().getRole() == Invitation.InvitationRole.ADMIN) {
                isAdmin = true;
            }
        }
        if (!isAdmin) {
            throw new APIException(HttpStatus.FORBIDDEN, "Only the owner or an admin can manage invitations");
        }
    }

    @Override
    @Transactional
    public InvitationResponse inviteMember(UUID orgId, InvitationRequest request, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        verifyOrgAdmin(org, currentUser);

        String email = request.getEmail().trim().toLowerCase();

        if (email.isEmpty() || !email.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Please provide a valid email address.");
        }

        // Check if user is already a member
        Optional<User> targetUserOpt = userRepository.findByEmail(email);
        User targetUser;
        if (targetUserOpt.isPresent()) {
            targetUser = targetUserOpt.get();
            if (org.getMembers().contains(targetUser) || org.getOwner().equals(targetUser)) {
                throw new APIException(HttpStatus.BAD_REQUEST, "User is already a member of this organization");
            }
        } else {
            // Create a temporary placeholder account before registration
            String placeholderName = email.substring(0, email.indexOf("@"));
            if (placeholderName.length() > 0) {
                placeholderName = placeholderName.substring(0, 1).toUpperCase() + placeholderName.substring(1);
            } else {
                placeholderName = "Invited Member";
            }
            
            targetUser = User.builder()
                    .name(placeholderName)
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build();
            targetUser = userRepository.save(targetUser);
        }

        // Check for existing pending invitation
        Optional<Invitation> existingPending = invitationRepository
                .findByOrganizationIdAndEmailIgnoreCaseAndStatus(orgId, email, Invitation.InvitationStatus.PENDING);
        if (existingPending.isPresent()) {
            throw new APIException(HttpStatus.BAD_REQUEST, "A pending invitation already exists for " + email);
        }

        // Generate token and create invitation
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        Invitation.InvitationRole role = parseRole(request.getRole());

        Invitation invitation = Invitation.builder()
                .email(email)
                .organization(org)
                .token(token)
                .role(role)
                .status(Invitation.InvitationStatus.PENDING)
                .invitedBy(currentUser)
                .expiresAt(expiresAt)
                .build();

        Invitation saved = invitationRepository.save(invitation);

        // Immediately add the invited user as an ACTIVE organization member!
        if (!org.getMembers().contains(targetUser)) {
            org.getMembers().add(targetUser);
            organizationRepository.save(org);
        }

        // Add to OrganizationMemberRole
        if (memberRoleRepository.findByOrganizationIdAndUserId(org.getId(), targetUser.getId()).isEmpty()) {
            OrganizationMemberRole memberRole = OrganizationMemberRole.builder()
                    .organization(org)
                    .user(targetUser)
                    .role(role)
                    .build();
            memberRoleRepository.save(memberRole);
        }

        // Send email (non-blocking)
        String inviteUrl = "http://localhost:5173/accept-invitation?token=" + token;
        try {
            emailService.sendInvitationEmail(email, org.getName(), inviteUrl);
        } catch (Exception e) {
            System.err.println("SMTP Exception caught while sending email: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    public List<InvitationResponse> getPendingInvitations(UUID orgId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        // Verify user is a member of this org
        boolean isMember = org.getOwner().equals(currentUser) || org.getMembers().contains(currentUser);
        if (!isMember) {
            throw new APIException(HttpStatus.FORBIDDEN, "You are not a member of this organization");
        }

        List<Invitation> pending = invitationRepository.findByOrganizationIdAndStatus(orgId, Invitation.InvitationStatus.PENDING);

        // Auto-expire old invitations
        LocalDateTime now = LocalDateTime.now();
        return pending.stream()
                .map(invite -> {
                    if (invite.getExpiresAt().isBefore(now)) {
                        invite.setStatus(Invitation.InvitationStatus.EXPIRED);
                        invitationRepository.save(invite);
                        return null; // exclude expired
                    }
                    return mapToResponse(invite);
                })
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvitationResponse resendInvitation(UUID orgId, UUID invitationId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        verifyOrgAdmin(org, currentUser);

        Invitation invite = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));

        if (!invite.getOrganization().getId().equals(orgId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Invitation does not belong to this organization");
        }

        if (invite.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Can only resend pending invitations");
        }

        // Generate new token and extend expiry
        invite.setToken(UUID.randomUUID().toString());
        invite.setExpiresAt(LocalDateTime.now().plusDays(7));
        Invitation updated = invitationRepository.save(invite);

        // Resend email
        String inviteUrl = "http://localhost:5173/accept-invitation?token=" + invite.getToken();
        try {
            emailService.sendInvitationEmail(invite.getEmail(), org.getName(), inviteUrl);
        } catch (Exception e) {
            System.err.println("SMTP Exception caught while resending email: " + e.getMessage());
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void cancelInvitation(UUID orgId, UUID invitationId, String currentUserEmail) {
        User currentUser = getUser(currentUserEmail);
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        verifyOrgAdmin(org, currentUser);

        Invitation invite = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));

        if (!invite.getOrganization().getId().equals(orgId)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Invitation does not belong to this organization");
        }

        if (invite.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Can only cancel pending invitations");
        }

        invitationRepository.delete(invite);
    }

    @Override
    public InvitationResponse validateToken(String token) {
        Invitation invite = invitationRepository.findByToken(token)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Invitation token not found"));

        if (invite.getStatus() == Invitation.InvitationStatus.ACCEPTED) {
            throw new APIException(HttpStatus.BAD_REQUEST, "This invitation has already been accepted");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(Invitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invite);
            throw new APIException(HttpStatus.BAD_REQUEST, "This invitation link has expired");
        }

        if (invite.getStatus() == Invitation.InvitationStatus.EXPIRED) {
            throw new APIException(HttpStatus.BAD_REQUEST, "This invitation link has expired");
        }

        return mapToResponse(invite);
    }

    @Override
    @Transactional
    public InvitationResponse acceptInvitation(String token, String currentUserEmail) {
        Invitation invite = invitationRepository.findByToken(token)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Invitation token not found"));

        if (invite.getStatus() == Invitation.InvitationStatus.ACCEPTED) {
            throw new APIException(HttpStatus.BAD_REQUEST, "This invitation has already been accepted");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(Invitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invite);
            throw new APIException(HttpStatus.BAD_REQUEST, "This invitation link has expired");
        }

        User currentUser = getUser(currentUserEmail);

        // Validate email match
        if (!invite.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new APIException(HttpStatus.BAD_REQUEST,
                    "This invitation was sent to " + invite.getEmail() + ", but you are logged in as " + currentUser.getEmail());
        }

        Organization org = invite.getOrganization();

        // Add to organization members
        if (!org.getMembers().contains(currentUser) && !org.getOwner().equals(currentUser)) {
            org.getMembers().add(currentUser);
            organizationRepository.save(org);
        }

        // Save role
        memberRoleRepository.findByOrganizationIdAndUserId(org.getId(), currentUser.getId())
                .ifPresentOrElse(
                        existingRole -> {
                            existingRole.setRole(invite.getRole());
                            memberRoleRepository.save(existingRole);
                        },
                        () -> {
                            OrganizationMemberRole newRole = OrganizationMemberRole.builder()
                                    .organization(org)
                                    .user(currentUser)
                                    .role(invite.getRole())
                                    .build();
                            memberRoleRepository.save(newRole);
                        }
                );

        // Mark invitation accepted
        invite.setStatus(Invitation.InvitationStatus.ACCEPTED);
        invite.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invite);

        return mapToResponse(invite);
    }

    @Override
    @Transactional
    public void autoAcceptPendingInvitations(String userEmail) {
        String email = userEmail.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();

        List<Invitation> pendingInvites = invitationRepository.findByEmailIgnoreCaseAndStatus(email, Invitation.InvitationStatus.PENDING);
        for (Invitation invite : pendingInvites) {
            if (invite.getExpiresAt().isAfter(LocalDateTime.now())) {
                Organization org = invite.getOrganization();
                if (!org.getMembers().contains(user) && !org.getOwner().equals(user)) {
                    org.getMembers().add(user);
                    organizationRepository.save(org);
                }

                memberRoleRepository.findByOrganizationIdAndUserId(org.getId(), user.getId())
                        .ifPresentOrElse(
                                existingRole -> {
                                    existingRole.setRole(invite.getRole());
                                    memberRoleRepository.save(existingRole);
                                },
                                () -> {
                                    OrganizationMemberRole newRole = OrganizationMemberRole.builder()
                                            .organization(org)
                                            .user(user)
                                            .role(invite.getRole())
                                            .build();
                                    memberRoleRepository.save(newRole);
                                }
                        );

                invite.setStatus(Invitation.InvitationStatus.ACCEPTED);
                invite.setAcceptedAt(LocalDateTime.now());
                invitationRepository.save(invite);
            }
        }
    }
}
