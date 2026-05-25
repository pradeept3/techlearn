package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * RoadmapNode — one step inside a Roadmap.
 *
 * A node can point to:
 *  - A full Track      (type = TRACK)
 *  - A single Lesson   (type = LESSON)
 *  - A Project         (type = PROJECT)
 *  - A Case Study      (type = CASE_STUDY)
 *  - An external link  (type = EXTERNAL)
 *
 * Prerequisites are other RoadmapNodes that must be COMPLETED
 * before this node becomes unlocked for the user.
 */
@Entity
@Table(name = "roadmap_nodes", indexes = {
    @Index(name = "idx_roadmap_nodes_roadmap", columnList = "roadmap_id"),
    @Index(name = "idx_roadmap_nodes_order",   columnList = "roadmap_id, node_order")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadmapNode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    /** 1-based position in the roadmap */
    @Column(name = "node_order", nullable = false)
    private int nodeOrder;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NodeType type;

    /**
     * ID of the referenced entity:
     *  - trackId  (String) if type == TRACK
     *  - lessonId (UUID)   if type == LESSON
     *  - projectId (UUID)  if type == PROJECT
     *  - caseStudyId (UUID) if type == CASE_STUDY
     */
    @Column(name = "reference_id", length = 100)
    private String referenceId;

    /** For EXTERNAL type nodes */
    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private int xpReward = 100;

    @Column(name = "is_optional", nullable = false)
    @Builder.Default
    private boolean optional = false;

    /**
     * IDs of RoadmapNodes that must be COMPLETED before this one unlocks.
     * Stored as comma-separated UUIDs for simplicity.
     * Use a join table if you need complex queries on prerequisites.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "roadmap_node_prerequisites",
        joinColumns = @JoinColumn(name = "node_id")
    )
    @Column(name = "prerequisite_node_id")
    @Builder.Default
    private List<UUID> prerequisiteNodeIds = new ArrayList<>();

    // ── Enums ────────────────────────────────────────────────────────────────

    public enum NodeType {
        TRACK,       // Complete an entire track
        LESSON,      // Complete a single lesson
        PROJECT,     // Build a project
        CASE_STUDY,  // Read a case study
        EXTERNAL,    // External resource / article
        QUIZ         // Standalone assessment
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public boolean hasPrerequisites() {
        return prerequisiteNodeIds != null && !prerequisiteNodeIds.isEmpty();
    }
}
