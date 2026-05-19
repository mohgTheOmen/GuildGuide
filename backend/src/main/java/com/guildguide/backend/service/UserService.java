package com.guildguide.backend.service;

import com.guildguide.backend.dto.PasswordChangeRequest;
import com.guildguide.backend.dto.UserProfileDTO;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserProfileDTO.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public UserProfileDTO updateProfile(String currentUsername, UserProfileDTO updateData) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateData.getUsername() != null && !updateData.getUsername().equals(currentUsername)) {
            if (userRepository.findByUsername(updateData.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(updateData.getUsername());
        }

        if (updateData.getAvatarUrl() != null) {
            user.setAvatarUrl(updateData.getAvatarUrl());
        }

        if (updateData.getBio() != null) {
            user.setBio(updateData.getBio());
        }

        User updatedUser = userRepository.save(user);
        
        return UserProfileDTO.builder()
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .avatarUrl(updatedUser.getAvatarUrl())
                .bio(updatedUser.getBio())
                .role(updatedUser.getRole().name())
                .build();
    }

    @Transactional
    public void changePassword(String username, PasswordChangeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
