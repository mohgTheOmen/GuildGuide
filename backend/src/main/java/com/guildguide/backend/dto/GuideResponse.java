package com.guildguide.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GuideResponse {
    private Long id;
    private String title;
    private String game;
    private String difficulty;
    private List<String> tags;
    private String content;
    private String authorUsername;
    private LocalDateTime createdAt;
    private Long views;
    private Long likes;
    private Long dislikes;
    private String imageUrl;
    private Boolean userVote;
    private Boolean isDraft;
    private Boolean isSaved;
}
