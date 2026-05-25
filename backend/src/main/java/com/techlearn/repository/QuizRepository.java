package com.techlearn.repository;

import com.techlearn.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ─── Quiz Repository ──────────────────────────────────────────────────────────
@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByTrackId(String trackId);
    List<Quiz> findByLessonId(UUID lessonId);
    List<Quiz> findByTrackIdAndIsPublishedTrue(String trackId);
    List<Quiz> findByLessonIdAndIsPublishedTrue(UUID lessonId);
    Optional<Quiz> findByIdAndIsPublishedTrue(UUID id);
}

