package com.guildguide.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "guides")
@Data
public class Guide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String game;

    private String difficulty;

    @ElementCollection
    private List<String> tags;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    private LocalDateTime createdAt;

    private Long views = 0L;
    private Long likes = 0L;
    private Long dislikes = 0L;

    private String imageUrl;

    @Column(name = "is_draft")
    private Boolean draft = false;

    public Boolean getIsDraft() {
        return draft;
    }

    public void setIsDraft(Boolean draft) {
        this.draft = draft;
    }
}
