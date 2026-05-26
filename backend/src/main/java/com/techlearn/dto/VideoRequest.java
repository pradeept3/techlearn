package com.techlearn.dto;

public record VideoRequest(
    String title,
    String description,
    String url,
    int durationMinutes
) {}
