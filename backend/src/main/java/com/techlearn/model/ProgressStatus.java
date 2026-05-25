package com.techlearn.model;

/**
 * ProgressStatus — represents the completion state of any learning unit
 * (lesson, track, roadmap node, quiz, or project).
 *
 * State machine:
 *   NOT_STARTED → IN_PROGRESS → COMPLETED
 *                            ↘ FAILED (quiz/assessment only)
 *                            ↘ SKIPPED (optional lessons only)
 *   Any state   → LOCKED      (prerequisites not met)
 */
public enum ProgressStatus {

    /**
     * The user has never opened this item.
     * Default state for all new content.
     */
    NOT_STARTED,

    /**
     * The user has opened the item but not completed it.
     * Applies when: lesson opened, quiz started but not submitted,
     * project started but not submitted.
     */
    IN_PROGRESS,

    /**
     * The user has fully completed the item and earned XP.
     * For quizzes: score >= passingScore.
     * For lessons: user clicked "Mark Complete".
     * For projects: submission accepted.
     */
    COMPLETED,

    /**
     * Quiz or assessment was submitted but score < passingScore.
     * The user can retry.
     */
    FAILED,

    /**
     * Item was deliberately skipped (allowed for optional lessons only).
     * Does not grant XP but allows progress to continue.
     */
    SKIPPED,

    /**
     * Item is locked because prerequisites have not been met.
     * E.g., Lesson 5 is LOCKED until Lesson 4 is COMPLETED.
     */
    LOCKED;

    // ── Convenience helpers ───────────────────────────────────────────────────

    public boolean isTerminal() {
        return this == COMPLETED || this == SKIPPED;
    }

    public boolean isActive() {
        return this == IN_PROGRESS;
    }

    public boolean canTransitionTo(ProgressStatus next) {
        return switch (this) {
            case LOCKED      -> next == NOT_STARTED;
            case NOT_STARTED -> next == IN_PROGRESS || next == LOCKED;
            case IN_PROGRESS -> next == COMPLETED || next == FAILED || next == SKIPPED;
            case FAILED      -> next == IN_PROGRESS; // allow retry
            case COMPLETED   -> false;               // terminal — no going back
            case SKIPPED     -> false;               // terminal
        };
    }

    /** Display-friendly label for frontend badges */
    public String label() {
        return switch (this) {
            case NOT_STARTED -> "Not Started";
            case IN_PROGRESS -> "In Progress";
            case COMPLETED   -> "Completed";
            case FAILED      -> "Failed";
            case SKIPPED     -> "Skipped";
            case LOCKED      -> "Locked";
        };
    }

    /** CSS colour token used by the frontend */
    public String colorToken() {
        return switch (this) {
            case NOT_STARTED -> "gray";
            case IN_PROGRESS -> "blue";
            case COMPLETED   -> "green";
            case FAILED      -> "red";
            case SKIPPED     -> "amber";
            case LOCKED      -> "slate";
        };
    }
}
