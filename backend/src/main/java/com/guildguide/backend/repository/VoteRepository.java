package com.guildguide.backend.repository;

import com.guildguide.backend.entity.Guide;
import com.guildguide.backend.entity.User;
import com.guildguide.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndGuide(User user, Guide guide);
    Optional<Vote> findByUserUsernameAndGuideId(String username, Long guideId);
}
