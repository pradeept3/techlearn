package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "track_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "track_id", nullable = false)
    private String trackId;

    @ElementCollection
    @CollectionTable(name = "completed_lessons",
        joinColumns = @JoinColumn(name = "progress_id"))
    @Column(name = "lesson_id")
    @Builder.Default
    private Set<String> completedLessons = new HashSet<>();

    @Column(name = "current_lesson_id")
    private String currentLessonId;

    @Column(name = "progress_percent")
    @Builder.Default
    private int progressPercent = 0;

    @Column(name = "xp_earned")
    @Builder.Default
    private int xpEarned = 0;

    @Column(name = "started_at")
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "last_activity_at")
    @Builder.Default
    private LocalDateTime lastActivityAt = LocalDateTime.now();

    public void completeLesson(String lessonId, int totalLessons, int xpReward) {
        this.completedLessons.add(lessonId);
        this.progressPercent = (int) ((completedLessons.size() * 100.0) / totalLessons);
        this.xpEarned += xpReward;
        this.lastActivityAt = LocalDateTime.now();
    }
}

// ─── DailyActivity entity ────────────────────────────────────────────────────
@Entity
@Table(name = "daily_activity",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "activity_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "activity_date")
    private java.time.LocalDate activityDate;

    @Column(name = "minutes_learned")
    @Builder.Default
    private int minutesLearned = 0;

    @Column(name = "lessons_completed")
    @Builder.Default
    private int lessonsCompleted = 0;
}
