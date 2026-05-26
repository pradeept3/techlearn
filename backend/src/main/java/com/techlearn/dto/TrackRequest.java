package com.techlearn.dto;

public record TrackRequest(
    String id,
    String name,
    String description,
    String icon,
    String color,
    String bgColor,
    int estimatedHours,
    String level,
    String tag
) {}
