package com.techlearn.dto;

import java.util.List;

public record LessonDetailDto(
    String id,
    String trackId,
    String title,
    String slug,
    int order,
    String type,
    int durationMinutes,
    String contentMarkdown,
    String summary,
    List<String> objectives,
    List<CodeExampleDto> codeExamples,
    QuizDto quiz,
    boolean completed
) {}
