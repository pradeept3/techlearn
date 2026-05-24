package com.techlearn.dto;

import java.util.List;

public record QuizDto(
    List<QuestionDto> questions,
    int passingScore
) {}
