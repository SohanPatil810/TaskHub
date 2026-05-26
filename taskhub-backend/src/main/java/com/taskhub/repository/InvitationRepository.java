package com.taskhub.repository;

import com.taskhub.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    Optional<Invitation> findByToken(String token);
    Optional<Invitation> findByOrganizationIdAndEmailAndStatus(UUID orgId, String email, Invitation.InvitationStatus status);
    List<Invitation> findByEmailIgnoreCaseAndStatus(String email, Invitation.InvitationStatus status);
    List<Invitation> findByOrganizationIdAndStatus(UUID orgId, Invitation.InvitationStatus status);
    Optional<Invitation> findByOrganizationIdAndEmailIgnoreCaseAndStatus(UUID orgId, String email, Invitation.InvitationStatus status);
}
