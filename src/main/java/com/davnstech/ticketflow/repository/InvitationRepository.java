package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByUsedAtIsNullOrderByCreatedAtDesc();
}
