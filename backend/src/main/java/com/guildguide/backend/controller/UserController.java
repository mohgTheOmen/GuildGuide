package com.guildguide.backend.controller;

import com.guildguide.backend.dto.PasswordChangeRequest;
import com.guildguide.backend.dto.UserProfileDTO;
import com.guildguide.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final com.guildguide.backend.service.GuideService guideService;
    private final com.guildguide.backend.service.CommentService commentService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            Authentication authentication,
            @RequestBody UserProfileDTO updateData) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), updateData));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody PasswordChangeRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/saved-guides")
    public ResponseEntity<java.util.List<com.guildguide.backend.dto.GuideResponse>> getSavedGuides(Authentication authentication) {
        return ResponseEntity.ok(guideService.getSavedGuides(authentication.getName()));
    }

    @PostMapping("/me/saved-guides/{guideId}")
    public ResponseEntity<Void> toggleSaveGuide(
            @PathVariable Long guideId,
            Authentication authentication) {
        guideService.toggleSaveGuide(guideId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/comments")
    public ResponseEntity<java.util.List<com.guildguide.backend.dto.CommentResponse>> getMyComments(Authentication authentication) {
        return ResponseEntity.ok(commentService.getCommentsByAuthor(authentication.getName()));
    }
}
