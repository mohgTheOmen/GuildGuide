package com.guildguide.backend.service;

import com.guildguide.backend.dto.CreateGuideRequest;
import com.guildguide.backend.dto.GuideResponse;
import com.guildguide.backend.entity.Guide;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.repository.GuideRepository;
import com.guildguide.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.guildguide.backend.entity.Vote;
import com.guildguide.backend.repository.VoteRepository;

@Service
@RequiredArgsConstructor
public class GuideService {

    private static final String DEFAULT_IMAGE_URL =
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070";

    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    private String resolveImageUrl(String imageUrl) {
        return imageUrl != null && !imageUrl.trim().isEmpty() ? imageUrl.trim() : DEFAULT_IMAGE_URL;
    }

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
        guide.setImageUrl(resolveImageUrl(request.getImageUrl()));
        guide.setIsDraft(request.getIsDraft() != null ? request.getIsDraft() : false);
        guide.setAuthor(author);
        guide.setCreatedAt(LocalDateTime.now());
        guide.setViews(0L);
        guide.setLikes(0L);
        guide.setDislikes(0L);

        Guide savedGuide = guideRepository.save(guide);

        return mapToResponse(savedGuide, username);
    }

    private GuideResponse mapToResponse(Guide guide, String currentUsername) {
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
        response.setImageUrl(resolveImageUrl(guide.getImageUrl()));
        response.setIsDraft(isDraft(guide));

        if (currentUsername != null) {
            Optional<Vote> voteOpt = voteRepository.findByUserUsernameAndGuideId(currentUsername, guide.getId());
            if (voteOpt.isPresent()) {
                response.setUserVote(voteOpt.get().isUpvote());
            }
            
            Optional<User> userOpt = userRepository.findByUsername(currentUsername);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                if (u.getSavedGuides() != null) {
                    response.setIsSaved(u.getSavedGuides().contains(guide));
                } else {
                    response.setIsSaved(false);
                }
            }
        } else {
            response.setIsSaved(false);
        }

        return response;
    }

    public List<GuideResponse> getAllGuides(String game, String category, String search, String sort, String username) {
        Stream<Guide> stream = guideRepository.findAll().stream()
                .filter(g -> !isDraft(g));

        if (game != null && !game.trim().isEmpty() && !game.equalsIgnoreCase("All Games")) {
            stream = stream.filter(g -> g.getGame() != null && g.getGame().toLowerCase().contains(game.toLowerCase()));
        }

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All Categories")) {
            stream = stream.filter(g -> 
                (g.getDifficulty() != null && g.getDifficulty().equalsIgnoreCase(category)) || 
                (g.getTags() != null && g.getTags().stream().anyMatch(t -> t.equalsIgnoreCase(category)))
            );
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            stream = stream.filter(g -> (g.getTitle() != null && g.getTitle().toLowerCase().contains(lowerSearch)) ||
                    (g.getContent() != null && g.getContent().toLowerCase().contains(lowerSearch)));
        }

        List<Guide> filteredList = stream.collect(Collectors.toList());

        if (sort != null && !sort.trim().isEmpty()) {
            if (sort.equalsIgnoreCase("Most Popular")) {
                filteredList.sort((a, b) -> Long.compare(b.getViews(), a.getViews()));
            } else if (sort.equalsIgnoreCase("Newest")) {
                filteredList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            } else if (sort.equalsIgnoreCase("Top Rated")) {
                filteredList.sort((a, b) -> Long.compare(b.getLikes(), a.getLikes()));
            }
        } else {
            filteredList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        return filteredList.stream()
                .map(g -> mapToResponse(g, username))
                .collect(Collectors.toList());
    }

    public GuideResponse getGuideById(Long id, String username) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        ensureCanAccessGuide(guide, username);
        return mapToResponse(guide, username);
    }

    public List<GuideResponse> getMyGuides(String username) {
        return guideRepository.findByAuthorUsername(username).stream()
                .map(g -> mapToResponse(g, username))
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
        guide.setImageUrl(resolveImageUrl(request.getImageUrl()));
        if (request.getIsDraft() != null) {
            guide.setIsDraft(request.getIsDraft());
        }

        if (request.getTags() != null && !request.getTags().trim().isEmpty()) {
            List<String> tagsList = Arrays.stream(request.getTags().split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList());
            guide.setTags(tagsList);
        }

        return mapToResponse(guideRepository.save(guide), username);
    }

    public void deleteGuide(Long id, String username) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        if (!guide.getAuthor().getUsername().equals(username)) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getRole() != com.guildguide.backend.entity.Role.ADMIN) {
                throw new RuntimeException("Not authorized to delete this guide");
            }
        }

        guideRepository.delete(guide);
    }

    public GuideResponse voteGuide(Long guideId, boolean isUpvote, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        ensurePublished(guide);

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
        return mapToResponse(savedGuide, username);
    }

    public List<GuideResponse> getSavedGuides(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getSavedGuides() == null) return List.of();
        
        return user.getSavedGuides().stream()
                .filter(g -> !isDraft(g))
                .map(g -> mapToResponse(g, username))
                .collect(Collectors.toList());
    }

    public void toggleSaveGuide(Long guideId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        ensurePublished(guide);

        if (user.getSavedGuides() == null) {
            user.setSavedGuides(new java.util.ArrayList<>());
        }

        if (user.getSavedGuides().contains(guide)) {
            user.getSavedGuides().remove(guide);
        } else {
            user.getSavedGuides().add(guide);
        }
        
        userRepository.save(user);
    }

    public void incrementViews(Long guideId) {
        Guide guide = guideRepository.findById(guideId).orElse(null);
        if (guide != null && !isDraft(guide)) {
            guide.setViews((guide.getViews() == null ? 0L : guide.getViews()) + 1L);
            guideRepository.save(guide);
        }
    }
}
