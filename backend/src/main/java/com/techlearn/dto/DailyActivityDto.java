package com.techlearn.dto;

public record DailyActivityDto(
    String date,
    int minutesLearned,
    int lessonsCompleted
) {}
