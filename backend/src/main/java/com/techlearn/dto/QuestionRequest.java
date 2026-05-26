package com.techlearn.dto;

import java.util.List;

public record QuestionRequest(
    String question,
    List<String> options
) {}
