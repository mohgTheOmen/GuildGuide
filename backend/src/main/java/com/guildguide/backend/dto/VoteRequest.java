package com.guildguide.backend.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class VoteRequest {
    @JsonProperty("isUpvote")
    private boolean isUpvote;
}
