package com.guildguide.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class CreateGuideRequest {
    @NotBlank
    @Size(min = 5, message = "Title must be at least 5 characters long.")
    private String title;

    @NotBlank
    private String game;

    private String difficulty;

    private String tags;

    @NotBlank
    private String content;

    private String imageUrl;
}
