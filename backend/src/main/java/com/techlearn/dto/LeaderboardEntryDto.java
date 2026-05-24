package com.techlearn.dto;

public record LeaderboardEntryDto(
    int rank,
    String userId,
    String name,
    String avatarUrl,
    int xp,
    int streak,
    boolean isCurrentUser
) {}
