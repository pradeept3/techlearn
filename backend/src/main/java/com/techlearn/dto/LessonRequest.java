package com.techlearn.dto;

import java.util.List;

public record LessonRequest(
    String title,
    String slug,
    Integer order,
    String type,
    int durationMinutes,
    String contentMarkdown,
    String summary,
    List<String> objectives,
    QuizRequest quiz
) {}
