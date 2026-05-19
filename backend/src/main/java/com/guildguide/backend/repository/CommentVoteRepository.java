package com.guildguide.backend.repository;

import com.guildguide.backend.entity.Comment;
import com.guildguide.backend.entity.CommentVote;
import com.guildguide.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    Optional<CommentVote> findByUserAndComment(User user, Comment comment);
    Optional<CommentVote> findByUserUsernameAndCommentId(String username, Long commentId);
}
