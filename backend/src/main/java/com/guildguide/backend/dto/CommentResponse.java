package com.guildguide.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private String authorUsername;
    private String authorAvatarUrl;
    private Long guideId;
    private LocalDateTime createdAt;
    private Long likes;
    private Long dislikes;
    private Boolean userVote;
}
