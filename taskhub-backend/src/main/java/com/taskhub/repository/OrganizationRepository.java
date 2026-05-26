package com.taskhub.repository;

import com.taskhub.entity.Organization;
import com.taskhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    // All orgs where the user is a member or is the owner
    @Query("SELECT o FROM Organization o WHERE o.owner = :user OR :user MEMBER OF o.members")
    List<Organization> findAllByUserMembership(@Param("user") User user);

    // Orgs owned by a specific user
    List<Organization> findByOwner(User owner);
}
