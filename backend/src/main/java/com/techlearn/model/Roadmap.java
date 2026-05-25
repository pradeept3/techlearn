package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Roadmap — a curated, ordered learning path.
 *
 * A roadmap is a sequence of RoadmapNodes, where each node
 * references a Track, Lesson, Project, or CaseStudy.
 * Users follow roadmaps to get structured end-to-end guidance.
 *
 * Example roadmap: "Become an ML Engineer"
 *   Node 1 → Track: Python        (prerequisite: none)
 *   Node 2 → Track: Data Analysis (prerequisite: Node 1)
 *   Node 3 → Track: Machine Learning (prerequisite: Node 2)
 *   Node 4 → Project: Stock Predictor (prerequisite: Node 3)
 *   Node 5 → Track: MLOps / Cloud    (prerequisite: Node 4)
 */
@Entity
@Table(name = "roadmaps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    /** e.g. "ML Engineer", "Full-Stack Java Dev", "Data Analyst" */
    @Column(name = "career_goal", length = 100)
    private String careerGoal;

    @Column(name = "estimated_weeks")
    private int estimatedWeeks;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;

    @Column(name = "thumbnail_emoji", length = 10)
    @Builder.Default
    private String thumbnailEmoji = "🗺️";

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private boolean published = true;

    /** Ordered list of nodes in this roadmap */
    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("nodeOrder ASC")
    @Builder.Default
    private List<RoadmapNode> nodes = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DifficultyLevel { BEGINNER, INTERMEDIATE, ADVANCED }

    /** Total XP available if all nodes completed */
    public int totalXp() {
        return nodes.stream().mapToInt(RoadmapNode::getXpReward).sum();
    }
}
