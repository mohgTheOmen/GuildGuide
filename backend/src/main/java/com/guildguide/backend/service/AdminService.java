package com.guildguide.backend.service;

import com.guildguide.backend.dto.AdminStatsResponse;
import com.guildguide.backend.repository.CommentRepository;
import com.guildguide.backend.repository.GuideRepository;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final GuideRepository guideRepository;
    private final CommentRepository commentRepository;

    public AdminStatsResponse getDashboardStats() {
        return new AdminStatsResponse(
                userRepository.count(),
                guideRepository.count(),
                commentRepository.count()
        );
    }
}
