package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UserNodeProgress — tracks the status of ONE RoadmapNode for ONE user.
 *
 * Created automatically when a user enrolls in a Roadmap.
 * One record per (UserRoadmapProgress, RoadmapNode) pair.
 */
@Entity
@Table(
    name = "user_node_progress",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_node_progress",
        columnNames = {"roadmap_progress_id", "roadmap_node_id"}
    ),
    indexes = {
        @Index(name = "idx_unp_progress", columnList = "roadmap_progress_id"),
        @Index(name = "idx_unp_node",     columnList = "roadmap_node_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserNodeProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Relationships ─────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_progress_id", nullable = false)
    private UserRoadmapProgress roadmapProgress;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_node_id", nullable = false)
    private RoadmapNode roadmapNode;

    // ── Status ────────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProgressStatus status = ProgressStatus.LOCKED;

    /** 0–100, meaningful for TRACK/LESSON type nodes */
    @Column(name = "progress_percent")
    @Builder.Default
    private int progressPercent = 0;

    /** XP earned from this specific node (0 until COMPLETED) */
    @Column(name = "xp_earned")
    @Builder.Default
    private int xpEarned = 0;

    /** Number of attempts (relevant for QUIZ nodes) */
    @Column(name = "attempts")
    @Builder.Default
    private int attempts = 0;

    /** Best score achieved (relevant for QUIZ/PROJECT nodes, 0–100) */
    @Column(name = "best_score")
    private Integer bestScore;

    /** Notes the user has written for this node (optional) */
    @Column(name = "user_notes", length = 2000)
    private String userNotes;

    // ── Timestamps ────────────────────────────────────────────────────────────

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_activity_at")
    @Builder.Default
    private LocalDateTime lastActivityAt = LocalDateTime.now();

    // ── State transitions ─────────────────────────────────────────────────────

    /** Unlock this node (prerequisites met). Only transitions from LOCKED. */
    public void unlock() {
        if (this.status == ProgressStatus.LOCKED) {
            this.status      = ProgressStatus.NOT_STARTED;
            this.unlockedAt  = LocalDateTime.now();
            this.lastActivityAt = LocalDateTime.now();
        }
    }

    /** User opens/starts this node. */
    public void start() {
        if (this.status == ProgressStatus.NOT_STARTED ||
            this.status == ProgressStatus.FAILED) {
            this.status          = ProgressStatus.IN_PROGRESS;
            if (this.startedAt == null) this.startedAt = LocalDateTime.now();
            this.attempts        += 1;
            this.lastActivityAt  = LocalDateTime.now();
        }
    }

    /** Update progress percentage (for TRACK/LESSON nodes). */
    public void updateProgress(int percent) {
        if (this.status == ProgressStatus.LOCKED ||
            this.status == ProgressStatus.COMPLETED) return;

        this.progressPercent = Math.min(100, Math.max(0, percent));
        if (this.progressPercent > 0 && this.status == ProgressStatus.NOT_STARTED) {
            start();
        }
        this.lastActivityAt = LocalDateTime.now();
    }

    /** Mark this node as COMPLETED and award XP. */
    public void complete(int score) {
        if (this.status == ProgressStatus.COMPLETED) return; // idempotent

        this.status          = ProgressStatus.COMPLETED;
        this.progressPercent = 100;
        this.xpEarned        = this.roadmapNode.getXpReward();
        this.bestScore       = (score > 0) ? score : null;
        this.completedAt     = LocalDateTime.now();
        this.lastActivityAt  = LocalDateTime.now();
    }

    /** Mark as FAILED (quiz/assessment). Allows retry. */
    public void fail(int score) {
        this.status         = ProgressStatus.FAILED;
        if (this.bestScore == null || score > this.bestScore) {
            this.bestScore  = score;
        }
        this.lastActivityAt = LocalDateTime.now();
    }

    /** Skip this node (optional nodes only). */
    public void skip() {
        if (this.roadmapNode.isOptional()) {
            this.status         = ProgressStatus.SKIPPED;
            this.lastActivityAt = LocalDateTime.now();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public boolean isAccessible() {
        return status != ProgressStatus.LOCKED;
    }

    public boolean isDone() {
        return status == ProgressStatus.COMPLETED || status == ProgressStatus.SKIPPED;
    }
}
