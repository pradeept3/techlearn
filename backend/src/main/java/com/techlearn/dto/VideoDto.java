package com.techlearn.dto;

public record VideoDto(
    String id,
    String title,
    String description,
    String url,
    int durationMinutes
) {}
