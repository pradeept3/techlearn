package com.techlearn.dto;

public record TrackProgressDto(
    String trackId,
    int progressPercent,
    int xpEarned,
    int completedLessons,
    int totalLessons,
    String lastActivityAt
) {}
