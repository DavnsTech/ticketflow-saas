package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByResetToken(String resetToken);
}
