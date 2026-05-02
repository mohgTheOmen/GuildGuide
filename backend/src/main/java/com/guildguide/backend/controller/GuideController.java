package com.guildguide.backend.controller;

import com.guildguide.backend.dto.CreateGuideRequest;
import com.guildguide.backend.dto.GuideResponse;
import com.guildguide.backend.service.GuideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guides")
@RequiredArgsConstructor
public class GuideController {

    private final GuideService guideService;

    @PostMapping
    public ResponseEntity<GuideResponse> createGuide(
            @Valid @RequestBody CreateGuideRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        GuideResponse response = guideService.createGuide(request, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GuideResponse>> getAllGuides() {
        return ResponseEntity.ok(guideService.getAllGuides());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuideResponse> getGuideById(@PathVariable Long id) {
        return ResponseEntity.ok(guideService.getGuideById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<GuideResponse>> getMyGuides(Authentication authentication) {
        return ResponseEntity.ok(guideService.getMyGuides(authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuideResponse> updateGuide(
            @PathVariable Long id,
            @Valid @RequestBody CreateGuideRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(guideService.updateGuide(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id, Authentication authentication) {
        guideService.deleteGuide(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
