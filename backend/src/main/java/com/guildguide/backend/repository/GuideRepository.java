package com.guildguide.backend.repository;

import com.guildguide.backend.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {
    java.util.List<Guide> findByAuthorUsername(String username);
}
