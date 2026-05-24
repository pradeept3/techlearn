package com.techlearn.dto;

import java.util.List;

public record QuestionDto(
    String id,
    String question,
    List<String> options
) {}
