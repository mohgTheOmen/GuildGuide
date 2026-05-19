package com.guildguide.backend.controller;

import com.guildguide.backend.dto.CommentRequest;
import com.guildguide.backend.dto.CommentResponse;
import com.guildguide.backend.dto.VoteRequest;
import com.guildguide.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guides/{guideId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    private String getUsername(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long guideId,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.getCommentsByGuideId(guideId, getUsername(authentication)));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long guideId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(commentService.createComment(guideId, request, authentication.getName()), HttpStatus.CREATED);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long guideId,
            @PathVariable Long commentId,
            Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long guideId,
            @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request, authentication.getName()));
    }

    @PostMapping("/{commentId}/vote")
    public ResponseEntity<CommentResponse> voteComment(
            @PathVariable Long guideId,
            @PathVariable Long commentId,
            @RequestBody VoteRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.voteComment(commentId, request.isUpvote(), authentication.getName()));
    }
}
