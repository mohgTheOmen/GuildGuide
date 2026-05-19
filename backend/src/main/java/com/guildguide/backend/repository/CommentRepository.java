package com.guildguide.backend.repository;

import com.guildguide.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByGuideIdOrderByCreatedAtDesc(Long guideId);
    List<Comment> findByAuthorOrderByCreatedAtDesc(com.guildguide.backend.entity.User author);
}
