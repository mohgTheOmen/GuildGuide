package com.guildguide.backend.service;

import com.guildguide.backend.dto.CommentRequest;
import com.guildguide.backend.dto.CommentResponse;
import com.guildguide.backend.entity.Comment;
import com.guildguide.backend.entity.Guide;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.repository.CommentRepository;
import com.guildguide.backend.repository.GuideRepository;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final GuideRepository guideRepository;
    private final UserRepository userRepository;

    public CommentResponse createComment(Long guideId, CommentRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setGuide(guide);
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment);
    }

    public List<CommentResponse> getCommentsByGuideId(Long guideId) {
        if (!guideRepository.existsById(guideId)) {
            throw new RuntimeException("Guide not found");
        }
        
        return commentRepository.findByGuideIdOrderByCreatedAtDesc(guideId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse mapToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorUsername(comment.getAuthor().getUsername());
        response.setGuideId(comment.getGuide().getId());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}
