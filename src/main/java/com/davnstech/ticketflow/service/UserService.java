package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.domain.UserRole;
import com.davnstech.ticketflow.dto.UserResponse;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse changeRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(UserRole.valueOf(roleName));
        return UserResponse.from(userRepository.save(user));
    }
}
