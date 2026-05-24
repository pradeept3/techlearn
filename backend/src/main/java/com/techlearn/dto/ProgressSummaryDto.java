package com.techlearn.dto;

import java.util.List;

public record ProgressSummaryDto(
    List<TrackProgressDto> tracks,
    int totalXp,
    int currentStreak,
    int longestStreak,
    int totalLessonsCompleted,
    List<DailyActivityDto> weeklyActivity
) {}
