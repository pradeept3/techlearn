package com.techlearn.dto;

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
    Integer userProgressPercent
) {}
