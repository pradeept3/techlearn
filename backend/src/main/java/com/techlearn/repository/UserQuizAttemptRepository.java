package com.techlearn.repository;

import com.techlearn.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQuizAttemptRepository extends JpaRepository<UserQuizAttempt, UUID> {
    List<UserQuizAttempt> findByUserIdAndQuizId(UUID userId, UUID quizId);
    Optional<UserQuizAttempt> findByUserIdAndQuizIdAndIsLatestAttemptTrue(UUID userId, UUID quizId);
    Optional<UserQuizAttempt> findTopByUserIdAndQuizIdAndIsLatestAttemptTrueOrderByCreatedAtDesc(UUID userId, UUID quizId);
}
