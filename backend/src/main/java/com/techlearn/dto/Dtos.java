package com.techlearn.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

// ─── Requests ─────────────────────────────────────────────────────────────────

public record AuthRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password
) {}

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 72) String password
) {}

// ─── Responses ────────────────────────────────────────────────────────────────

@Builder
public record AuthResponse(
    String token,
    String refreshToken,
    UserDto user
) {
    public record UserDto(
        String id,
        String name,
        String email,
        String avatarUrl,
        String role,
        String createdAt,
        int xp,
        int streak,
        int level
    ) {}
}

// ─── Track DTOs ───────────────────────────────────────────────────────────────

public record TrackDto(
    String id,
    String name,
    String description,
    String icon,
    String color,
    String bgColor,
    int totalLessons,
    String level,
    String tag,
    int estimatedHours,
    Integer userProgressPercent  // null if not started
) {}

// ─── Lesson DTOs ──────────────────────────────────────────────────────────────

public record LessonSummaryDto(
    String id,
    String trackId,
    String title,
    String slug,
    int order,
    String type,
    int durationMinutes,
    boolean completed  // for authenticated users
) {}

public record LessonDetailDto(
    String id,
    String trackId,
    String title,
    String slug,
    int order,
    String type,
    int durationMinutes,
    String contentMarkdown,
    String summary,
    java.util.List<String> objectives,
    java.util.List<CodeExampleDto> codeExamples,
    QuizDto quiz,
    boolean completed
) {}

public record CodeExampleDto(
    String id,
    String title,
    String language,
    String code,
    String expectedOutput,
    String explanation
) {}

public record QuizDto(
    java.util.List<QuestionDto> questions,
    int passingScore
) {}

public record QuestionDto(
    String id,
    String question,
    java.util.List<String> options
    // Note: correctIndex NOT sent to client until answered
) {}

// ─── Progress DTOs ────────────────────────────────────────────────────────────

public record ProgressSummaryDto(
    java.util.List<TrackProgressDto> tracks,
    int totalXp,
    int currentStreak,
    int longestStreak,
    int totalLessonsCompleted,
    java.util.List<DailyActivityDto> weeklyActivity
) {}

public record TrackProgressDto(
    String trackId,
    int progressPercent,
    int xpEarned,
    int completedLessons,
    int totalLessons,
    String lastActivityAt
) {}

public record DailyActivityDto(
    String date,
    int minutesLearned,
    int lessonsCompleted
) {}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

public record LeaderboardEntryDto(
    int rank,
    String userId,
    String name,
    String avatarUrl,
    int xp,
    int streak,
    boolean isCurrentUser
) {}

// ─── Generic API response ─────────────────────────────────────────────────────

public record ApiResponse<T>(T data, String message, boolean success) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, true);
    }
    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message, true);
    }
}

public record PagedResponse<T>(
    java.util.List<T> data,
    long total,
    int page,
    int pageSize,
    int totalPages
) {}
