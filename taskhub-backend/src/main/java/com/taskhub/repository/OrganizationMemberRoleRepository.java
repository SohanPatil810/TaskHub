package com.taskhub.repository;

import com.taskhub.entity.OrganizationMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationMemberRoleRepository extends JpaRepository<OrganizationMemberRole, UUID> {
    Optional<OrganizationMemberRole> findByOrganizationIdAndUserId(UUID orgId, UUID userId);
}
