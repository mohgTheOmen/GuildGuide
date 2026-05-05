package com.guildguide.backend.service;

import com.guildguide.backend.dto.CreateGuideRequest;
import com.guildguide.backend.dto.GuideResponse;
import com.guildguide.backend.entity.Guide;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.repository.GuideRepository;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.guildguide.backend.entity.Vote;
import com.guildguide.backend.repository.VoteRepository;

@Service
@RequiredArgsConstructor
public class GuideService {

    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public GuideResponse createGuide(CreateGuideRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Guide guide = new Guide();
        guide.setTitle(request.getTitle());
        guide.setGame(request.getGame());
        guide.setDifficulty(request.getDifficulty());

        if (request.getTags() != null && !request.getTags().trim().isEmpty()) {
            List<String> tagsList = Arrays.stream(request.getTags().split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList());
            guide.setTags(tagsList);
        }

        guide.setContent(request.getContent());
        guide.setImageUrl(request.getImageUrl() != null ? request.getImageUrl()
                : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070");
        guide.setAuthor(author);
        guide.setCreatedAt(LocalDateTime.now());
        guide.setViews(0L);
        guide.setLikes(0L);
        guide.setDislikes(0L);

        Guide savedGuide = guideRepository.save(guide);

        return mapToResponse(savedGuide);
    }

    private GuideResponse mapToResponse(Guide guide) {
        GuideResponse response = new GuideResponse();
        response.setId(guide.getId());
        response.setTitle(guide.getTitle());
        response.setGame(guide.getGame());
        response.setDifficulty(guide.getDifficulty());
        response.setTags(guide.getTags());
        response.setContent(guide.getContent());
        response.setAuthorUsername(guide.getAuthor().getUsername());
        response.setCreatedAt(guide.getCreatedAt());
        response.setViews(guide.getViews());
        response.setLikes(guide.getLikes());
        response.setDislikes(guide.getDislikes());
        response.setImageUrl(guide.getImageUrl());
        return response;
    }

    public List<GuideResponse> getAllGuides() {
        return guideRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GuideResponse getGuideById(Long id) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        return mapToResponse(guide);
    }

    public List<GuideResponse> getMyGuides(String username) {
        return guideRepository.findByAuthorUsername(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GuideResponse updateGuide(Long id, CreateGuideRequest request, String username) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        if (!guide.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to edit this guide");
        }

        guide.setTitle(request.getTitle());
        guide.setGame(request.getGame());
        guide.setDifficulty(request.getDifficulty());
        guide.setContent(request.getContent());

        if (request.getTags() != null && !request.getTags().trim().isEmpty()) {
            List<String> tagsList = Arrays.stream(request.getTags().split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList());
            guide.setTags(tagsList);
        }

        return mapToResponse(guideRepository.save(guide));
    }

    public void deleteGuide(Long id, String username) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        if (!guide.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to delete this guide");
        }

        guideRepository.delete(guide);
    }

    public GuideResponse voteGuide(Long guideId, boolean isUpvote, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        Optional<Vote> existingVoteOpt = voteRepository.findByUserAndGuide(user, guide);

        if (existingVoteOpt.isPresent()) {
            Vote existingVote = existingVoteOpt.get();
            if (existingVote.isUpvote() == isUpvote) {
                if (isUpvote) {
                    guide.setLikes(guide.getLikes() - 1);
                } else {
                    guide.setDislikes(guide.getDislikes() - 1);
                }
                voteRepository.delete(existingVote);
            } else {
                if (isUpvote) {
                    guide.setLikes(guide.getLikes() + 1);
                    guide.setDislikes(guide.getDislikes() - 1);
                } else {
                    guide.setLikes(guide.getLikes() - 1);
                    guide.setDislikes(guide.getDislikes() + 1);
                }
                existingVote.setUpvote(isUpvote);
                voteRepository.save(existingVote);
            }
        } else {
            Vote newVote = new Vote();
            newVote.setUser(user);
            newVote.setGuide(guide);
            newVote.setUpvote(isUpvote);
            voteRepository.save(newVote);

            if (isUpvote) {
                guide.setLikes(guide.getLikes() + 1);
            } else {
                guide.setDislikes(guide.getDislikes() + 1);
            }
        }

        Guide savedGuide = guideRepository.save(guide);
        return mapToResponse(savedGuide);
    }
}
