package com.guildguide.backend.service;

import com.guildguide.backend.dto.CommentRequest;
import com.guildguide.backend.dto.CommentResponse;
import com.guildguide.backend.entity.Comment;
import com.guildguide.backend.entity.CommentVote;
import com.guildguide.backend.entity.Guide;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.repository.CommentRepository;
import com.guildguide.backend.repository.CommentVoteRepository;
import com.guildguide.backend.repository.GuideRepository;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final CommentVoteRepository commentVoteRepository;

    private boolean isDraft(Guide guide) {
        return Boolean.TRUE.equals(guide.getIsDraft());
    }

    private boolean isAuthor(Guide guide, String username) {
        return username != null && guide.getAuthor().getUsername().equals(username);
    }

    private void ensureCanAccessGuide(Guide guide, String username) {
        if (isDraft(guide) && !isAuthor(guide, username)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide not found");
        }
    }

    private void ensurePublished(Guide guide) {
        if (isDraft(guide)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide not found");
        }
    }

    public CommentResponse createComment(Long guideId, CommentRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        ensurePublished(guide);

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setGuide(guide);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setLikes(0L);
        comment.setDislikes(0L);

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment, username);
    }

    public List<CommentResponse> getCommentsByGuideId(Long guideId, String username) {
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        ensureCanAccessGuide(guide, username);
        
        return commentRepository.findByGuideIdOrderByCreatedAtDesc(guideId).stream()
                .map(comment -> mapToResponse(comment, username))
                .collect(Collectors.toList());
    }

    private CommentResponse mapToResponse(Comment comment, String currentUsername) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorUsername(comment.getAuthor().getUsername());
        response.setAuthorAvatarUrl(comment.getAuthor().getAvatarUrl());
        response.setGuideId(comment.getGuide().getId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setLikes(comment.getLikes() == null ? 0L : comment.getLikes());
        response.setDislikes(comment.getDislikes() == null ? 0L : comment.getDislikes());

        if (currentUsername != null) {
            commentVoteRepository.findByUserUsernameAndCommentId(currentUsername, comment.getId())
                    .ifPresent(vote -> response.setUserVote(vote.isUpvote()));
        }

        return response;
    }

    public void deleteComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthor().getUsername().equals(username) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    public CommentResponse updateComment(Long commentId, CommentRequest request, String username) {
        if (request == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        ensurePublished(comment.getGuide());

        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to edit this comment");
        }

        comment.setContent(request.getContent().trim());
        return mapToResponse(commentRepository.save(comment), username);
    }

    public List<CommentResponse> getCommentsByAuthor(String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return commentRepository.findByAuthorOrderByCreatedAtDesc(author).stream()
                .map(comment -> mapToResponse(comment, username))
                .collect(Collectors.toList());
    }

    public CommentResponse voteComment(Long commentId, boolean isUpvote, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        ensurePublished(comment.getGuide());

        Optional<CommentVote> existingVoteOpt = commentVoteRepository.findByUserAndComment(user, comment);

        long likes = comment.getLikes() == null ? 0L : comment.getLikes();
        long dislikes = comment.getDislikes() == null ? 0L : comment.getDislikes();

        if (existingVoteOpt.isPresent()) {
            CommentVote existingVote = existingVoteOpt.get();
            if (existingVote.isUpvote() == isUpvote) {
                if (isUpvote) {
                    likes--;
                } else {
                    dislikes--;
                }
                commentVoteRepository.delete(existingVote);
            } else {
                if (isUpvote) {
                    likes++;
                    dislikes--;
                } else {
                    likes--;
                    dislikes++;
                }
                existingVote.setUpvote(isUpvote);
                commentVoteRepository.save(existingVote);
            }
        } else {
            CommentVote newVote = new CommentVote();
            newVote.setUser(user);
            newVote.setComment(comment);
            newVote.setUpvote(isUpvote);
            commentVoteRepository.save(newVote);

            if (isUpvote) {
                likes++;
            } else {
                dislikes++;
            }
        }

        comment.setLikes(Math.max(0L, likes));
        comment.setDislikes(Math.max(0L, dislikes));
        return mapToResponse(commentRepository.save(comment), username);
    }
}
