package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * UserRoadmapProgress — tracks a user's progress through a full Roadmap.
 *
 * One record exists per (user, roadmap) pair.
 * Each node in the roadmap has a corresponding UserNodeProgress child record
 * that holds the per-node ProgressStatus.
 *
 * Relationships:
 *   User           1 ──── * UserRoadmapProgress
 *   Roadmap        1 ──── * UserRoadmapProgress
 *   UserRoadmapProgress 1 ──── * UserNodeProgress
 */
@Entity
@Table(
    name = "user_roadmap_progress",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_user_roadmap",
        columnNames = {"user_id", "roadmap_id"}
    ),
    indexes = {
        @Index(name = "idx_urp_user",    columnList = "user_id"),
        @Index(name = "idx_urp_roadmap", columnList = "roadmap_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserRoadmapProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Relationships ─────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    // ── Roadmap-level status ──────────────────────────────────────────────────

    /**
     * Overall status of this roadmap for the user.
     * Derived from node statuses:
     *   - NOT_STARTED  → no nodes started
     *   - IN_PROGRESS  → at least one node IN_PROGRESS or COMPLETED but not all done
     *   - COMPLETED    → all non-optional nodes COMPLETED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    /** Percentage of non-optional nodes completed (0–100) */
    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private int progressPercent = 0;

    /** Total XP earned from this roadmap so far */
    @Column(name = "xp_earned", nullable = false)
    @Builder.Default
    private int xpEarned = 0;

    /** The node the user should work on next (null if completed or not started) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_node_id")
    private RoadmapNode currentNode;

    // ── Per-node progress ─────────────────────────────────────────────────────

    @OneToMany(
        mappedBy = "roadmapProgress",
        cascade  = CascadeType.ALL,
        orphanRemoval = true,
        fetch    = FetchType.LAZY
    )
    @Builder.Default
    private List<UserNodeProgress> nodeProgressList = new ArrayList<>();

    // ── Timestamps ────────────────────────────────────────────────────────────

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Column(name = "last_activity_at", nullable = false)
    @Builder.Default
    private LocalDateTime lastActivityAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // ── Business logic ────────────────────────────────────────────────────────

    /**
     * Recalculate progressPercent, status, xpEarned, and currentNode
     * based on all child UserNodeProgress records.
     * Call this after any node status change.
     */
    public void recalculate() {
        if (nodeProgressList == null || nodeProgressList.isEmpty()) return;

        List<UserNodeProgress> required = nodeProgressList.stream()
            .filter(np -> !np.getRoadmapNode().isOptional())
            .toList();

        long completedCount = required.stream()
            .filter(np -> np.getStatus() == ProgressStatus.COMPLETED ||
                          np.getStatus() == ProgressStatus.SKIPPED)
            .count();

        this.progressPercent = required.isEmpty()
            ? 0
            : (int) Math.round((completedCount * 100.0) / required.size());

        this.xpEarned = nodeProgressList.stream()
            .filter(np -> np.getStatus() == ProgressStatus.COMPLETED)
            .mapToInt(np -> np.getRoadmapNode().getXpReward())
            .sum();

        boolean anyStarted = nodeProgressList.stream()
            .anyMatch(np -> np.getStatus() != ProgressStatus.NOT_STARTED &&
                            np.getStatus() != ProgressStatus.LOCKED);

        if (completedCount == required.size() && !required.isEmpty()) {
            this.status      = ProgressStatus.COMPLETED;
            this.completedAt = LocalDateTime.now();
        } else if (anyStarted) {
            this.status = ProgressStatus.IN_PROGRESS;
        } else {
            this.status = ProgressStatus.NOT_STARTED;
        }

        // Advance currentNode to the first IN_PROGRESS or unlocked NOT_STARTED node
        this.currentNode = nodeProgressList.stream()
            .filter(np -> np.getStatus() == ProgressStatus.IN_PROGRESS ||
                          np.getStatus() == ProgressStatus.NOT_STARTED)
            .map(UserNodeProgress::getRoadmapNode)
            .min(java.util.Comparator.comparingInt(RoadmapNode::getNodeOrder))
            .orElse(null);

        this.lastActivityAt = LocalDateTime.now();
    }

    /**
     * Find the UserNodeProgress for a specific RoadmapNode.
     */
    public Optional<UserNodeProgress> findNodeProgress(UUID nodeId) {
        return nodeProgressList.stream()
            .filter(np -> np.getRoadmapNode().getId().equals(nodeId))
            .findFirst();
    }

    /** True if the user has enrolled (started) this roadmap */
    public boolean isEnrolled() {
        return status != ProgressStatus.NOT_STARTED;
    }

    /** True if every required node is completed */
    public boolean isCompleted() {
        return status == ProgressStatus.COMPLETED;
    }
}
