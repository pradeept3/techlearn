package com.techlearn.service;

import com.techlearn.model.*;
import com.techlearn.repository.RoadmapRepository;
import com.techlearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * RoadmapService — business logic for roadmap enrollment and progression.
 *
 * Key operations:
 *  1. enroll()         — enrol a user into a roadmap, create all node records
 *  2. startNode()      — user opens a node (LOCKED/NOT_STARTED → IN_PROGRESS)
 *  3. completeNode()   — user finishes a node (→ COMPLETED), unlock next nodes
 *  4. failNode()       — quiz/assessment failed, allow retry
 *  5. skipNode()       — skip optional node
 *  6. getProgress()    — load full roadmap progress for a user
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoadmapService {

    private static final Logger log = LoggerFactory.getLogger(RoadmapService.class);
    private final RoadmapRepository roadmapRepo;
    private final UserRepository    userRepo;

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<Roadmap> getAllRoadmaps() {
        return roadmapRepo.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public Roadmap getRoadmap(UUID roadmapId) {
        return roadmapRepo.findByIdWithNodes(roadmapId)
            .orElseThrow(() -> new NoSuchElementException("Roadmap not found: " + roadmapId));
    }

    /**
     * Get (or lazily create) a user's progress record for a roadmap.
     * If the user has never enrolled, returns a transient NOT_STARTED summary.
     */
    @Transactional(readOnly = true)
    public UserRoadmapProgress getProgress(UUID userId, UUID roadmapId) {
        var user    = userRepo.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));
        var roadmap = getRoadmap(roadmapId);

        // Build a lightweight transient view for users who haven't enrolled yet
        return UserRoadmapProgress.builder()
            .user(user)
            .roadmap(roadmap)
            .status(ProgressStatus.NOT_STARTED)
            .progressPercent(0)
            .xpEarned(0)
            .nodeProgressList(buildLockedNodeList(roadmap))
            .build();
    }

    // ── Enrollment ────────────────────────────────────────────────────────────

    /**
     * Enroll a user in a roadmap.
     * Creates one UserNodeProgress per RoadmapNode:
     *   - Nodes with no prerequisites → NOT_STARTED (unlocked)
     *   - Nodes with prerequisites    → LOCKED
     */
    public UserRoadmapProgress enroll(UUID userId, UUID roadmapId) {
        var user    = userRepo.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));
        var roadmap = getRoadmap(roadmapId);

        log.info("Enrolling user {} in roadmap '{}'", userId, roadmap.getTitle());

        var progress = UserRoadmapProgress.builder()
            .user(user)
            .roadmap(roadmap)
            .status(ProgressStatus.NOT_STARTED)
            .build();

        // Create a UserNodeProgress for every node
        List<UserNodeProgress> nodeProgressList = new ArrayList<>();
        for (RoadmapNode node : roadmap.getNodes()) {
            ProgressStatus initial = node.hasPrerequisites()
                ? ProgressStatus.LOCKED
                : ProgressStatus.NOT_STARTED;

            var nodeProgress = UserNodeProgress.builder()
                .roadmapProgress(progress)
                .roadmapNode(node)
                .status(initial)
                .build();

            if (initial == ProgressStatus.NOT_STARTED) {
                nodeProgress.unlock();
            }
            nodeProgressList.add(nodeProgress);
        }

        progress.setNodeProgressList(nodeProgressList);
        progress.recalculate();

        log.info("Enrolled user {} — {} nodes created ({} unlocked)",
            userId, nodeProgressList.size(),
            nodeProgressList.stream().filter(n -> n.getStatus() != ProgressStatus.LOCKED).count());

        return progress;
    }

    // ── Node transitions ──────────────────────────────────────────────────────

    /**
     * User opens a node — transition NOT_STARTED → IN_PROGRESS.
     */
    public UserNodeProgress startNode(UUID userId, UUID roadmapId, UUID nodeId) {
        var nodeProgress = findNodeProgress(userId, roadmapId, nodeId);

        if (nodeProgress.getStatus() == ProgressStatus.LOCKED) {
            throw new IllegalStateException("Node is locked — complete prerequisites first");
        }

        nodeProgress.start();
        nodeProgress.getRoadmapProgress().recalculate();

        log.info("User {} started node {} in roadmap {}", userId, nodeId, roadmapId);
        return nodeProgress;
    }

    /**
     * Update progress percentage for a TRACK or LESSON node.
     */
    public UserNodeProgress updateNodeProgress(UUID userId, UUID roadmapId,
                                               UUID nodeId, int percent) {
        var nodeProgress = findNodeProgress(userId, roadmapId, nodeId);
        nodeProgress.updateProgress(percent);

        // Auto-complete if 100%
        if (percent >= 100) {
            return completeNode(userId, roadmapId, nodeId, 100);
        }

        nodeProgress.getRoadmapProgress().recalculate();
        return nodeProgress;
    }

    /**
     * Mark a node COMPLETED, award XP, and unlock nodes whose
     * prerequisites are now fully satisfied.
     */
    public UserNodeProgress completeNode(UUID userId, UUID roadmapId,
                                         UUID nodeId, int score) {
        var nodeProgress     = findNodeProgress(userId, roadmapId, nodeId);
        var roadmapProgress  = nodeProgress.getRoadmapProgress();

        nodeProgress.complete(score);
        log.info("User {} completed node {} (score={})", userId, nodeId, score);

        // Award XP to user
        var user = roadmapProgress.getUser();
        user.addXp(nodeProgress.getXpEarned());
        userRepo.save(user);

        // Unlock any node whose prerequisites are now all COMPLETED
        unlockEligibleNodes(roadmapProgress);

        roadmapProgress.recalculate();

        if (roadmapProgress.isCompleted()) {
            log.info("User {} completed roadmap '{}'!", userId, roadmapProgress.getRoadmap().getTitle());
        }

        return nodeProgress;
    }

    /**
     * Record a FAILED attempt (quiz/assessment).
     */
    public UserNodeProgress failNode(UUID userId, UUID roadmapId,
                                      UUID nodeId, int score) {
        var nodeProgress = findNodeProgress(userId, roadmapId, nodeId);
        nodeProgress.fail(score);
        log.info("User {} failed node {} (score={})", userId, nodeId, score);
        return nodeProgress;
    }

    /**
     * Skip an optional node.
     */
    public UserNodeProgress skipNode(UUID userId, UUID roadmapId, UUID nodeId) {
        var nodeProgress = findNodeProgress(userId, roadmapId, nodeId);

        if (!nodeProgress.getRoadmapNode().isOptional()) {
            throw new IllegalStateException("Only optional nodes can be skipped");
        }

        nodeProgress.skip();
        unlockEligibleNodes(nodeProgress.getRoadmapProgress());
        nodeProgress.getRoadmapProgress().recalculate();

        log.info("User {} skipped optional node {}", userId, nodeId);
        return nodeProgress;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private UserNodeProgress findNodeProgress(UUID userId, UUID roadmapId, UUID nodeId) {
        // In a real implementation, inject and use UserRoadmapProgressRepository.
        // Shown here as a structural placeholder.
        throw new UnsupportedOperationException(
            "Wire UserRoadmapProgressRepository and UserNodeProgressRepository here");
    }

    /**
     * After a node is completed/skipped, check every LOCKED node in the roadmap.
     * If all of its prerequisites are now COMPLETED or SKIPPED, unlock it.
     */
    private void unlockEligibleNodes(UserRoadmapProgress roadmapProgress) {
        Set<UUID> doneNodeIds = new HashSet<>();
        for (UserNodeProgress np : roadmapProgress.getNodeProgressList()) {
            if (np.isDone()) {
                doneNodeIds.add(np.getRoadmapNode().getId());
            }
        }

        for (UserNodeProgress np : roadmapProgress.getNodeProgressList()) {
            if (np.getStatus() != ProgressStatus.LOCKED) continue;

            List<UUID> prereqs = np.getRoadmapNode().getPrerequisiteNodeIds();
            boolean prereqsMet = prereqs == null || doneNodeIds.containsAll(prereqs);

            if (prereqsMet) {
                np.unlock();
                log.debug("Unlocked node '{}' for user {}",
                    np.getRoadmapNode().getTitle(),
                    roadmapProgress.getUser().getId());
            }
        }
    }

    /** Build a list of transient LOCKED node-progress objects (for unenrolled users). */
    private List<UserNodeProgress> buildLockedNodeList(Roadmap roadmap) {
        return roadmap.getNodes().stream()
            .map(node -> UserNodeProgress.builder()
                .roadmapNode(node)
                .status(node.hasPrerequisites() ? ProgressStatus.LOCKED : ProgressStatus.NOT_STARTED)
                .build())
            .toList();
    }
}
