package com.guildguide.backend.controller;

import com.guildguide.backend.dto.CommentRequest;
import com.guildguide.backend.dto.CommentResponse;
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

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long guideId) {
        return ResponseEntity.ok(commentService.getCommentsByGuideId(guideId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long guideId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(commentService.createComment(guideId, request, authentication.getName()), HttpStatus.CREATED);
    }
}
