package com.techlearn.dto;

import java.util.List;

public record LessonSummaryDto(
    String id,
    String trackId,
    String title,
    String slug,
    int order,
    String type,
    int durationMinutes,
    boolean completed
) {}
