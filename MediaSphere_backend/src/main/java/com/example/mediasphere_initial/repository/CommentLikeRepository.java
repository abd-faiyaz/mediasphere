package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.CommentLike;
import com.example.mediasphere_initial.model.Comment;
import com.example.mediasphere_initial.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {

    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);

    List<CommentLike> findByComment(Comment comment);

    @Query("SELECT cl.user FROM CommentLike cl WHERE cl.comment.id = :commentId")
    List<User> findUsersByCommentId(@Param("commentId") UUID commentId);

    long countByComment(Comment comment);

    @Transactional
    void deleteByCommentAndUser(Comment comment, User user);

    boolean existsByCommentAndUser(Comment comment, User user);
}
