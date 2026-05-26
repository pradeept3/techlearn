package com.techlearn.dto;

import java.util.List;

public record QuizRequest(
    List<QuestionRequest> questions,
    int passingScore
) {}
