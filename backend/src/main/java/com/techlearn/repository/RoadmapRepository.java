package com.techlearn.repository;

import com.techlearn.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ─── Roadmap Repository ───────────────────────────────────────────────────────
@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {

    List<Roadmap> findByPublishedTrueOrderByCreatedAtDesc();

    List<Roadmap> findByDifficultyAndPublishedTrue(Roadmap.DifficultyLevel difficulty);

    @Query("SELECT r FROM Roadmap r JOIN FETCH r.nodes WHERE r.id = :id")
    Optional<Roadmap> findByIdWithNodes(@Param("id") UUID id);
}

// ─── UserRoadmapProgress Repository ──────────────────────────────────────────
@Repository
interface UserRoadmapProgressRepository
        extends JpaRepository<UserRoadmapProgress, UUID> {

    /** All roadmaps a user is enrolled in */
    List<UserRoadmapProgress> findByUser_Id(UUID userId);

    /** All enrollments for a roadmap */
    List<UserRoadmapProgress> findByRoadmap_Id(UUID roadmapId);

    /** Find a user's progress record for one specific roadmap */
    Optional<UserRoadmapProgress> findByUser_IdAndRoadmap_Id(UUID userId, UUID roadmapId);

    /** All in-progress roadmaps for a user */
    @Query("""
        SELECT urp FROM UserRoadmapProgress urp
        WHERE urp.user.id = :userId
          AND urp.status  = com.techlearn.model.ProgressStatus.IN_PROGRESS
        ORDER BY urp.lastActivityAt DESC
        """)
    List<UserRoadmapProgress> findActiveByUserId(@Param("userId") UUID userId);

    /** Count how many users completed a roadmap */
    long countByRoadmap_IdAndStatus(UUID roadmapId, ProgressStatus status);

    boolean existsByUser_IdAndRoadmap_Id(UUID userId, UUID roadmapId);
}

// ─── UserNodeProgress Repository ─────────────────────────────────────────────
@Repository
interface UserNodeProgressRepository
        extends JpaRepository<UserNodeProgress, UUID> {

    /** All node-progress records for a roadmap enrollment */
    List<UserNodeProgress> findByRoadmapProgress_Id(UUID roadmapProgressId);

    /** One node's progress for a specific enrollment */
    Optional<UserNodeProgress> findByRoadmapProgress_IdAndRoadmapNode_Id(
            UUID roadmapProgressId, UUID nodeId);

    /** All node-progress records with a given status for a user's roadmap */
    @Query("""
        SELECT unp FROM UserNodeProgress unp
        WHERE unp.roadmapProgress.id = :progressId
          AND unp.status             = :status
        ORDER BY unp.roadmapNode.nodeOrder ASC
        """)
    List<UserNodeProgress> findByProgressAndStatus(
            @Param("progressId") UUID progressId,
            @Param("status")     ProgressStatus status);
}

// ─── RoadmapNode Repository ───────────────────────────────────────────────────
@Repository
interface RoadmapNodeRepository extends JpaRepository<RoadmapNode, UUID> {

    List<RoadmapNode> findByRoadmap_IdOrderByNodeOrderAsc(UUID roadmapId);

    Optional<RoadmapNode> findByRoadmap_IdAndNodeOrder(UUID roadmapId, int nodeOrder);
}
