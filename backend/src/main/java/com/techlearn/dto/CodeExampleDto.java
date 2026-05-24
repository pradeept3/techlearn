package com.techlearn.dto;

import java.util.List;

public record CodeExampleDto(
    String id,
    String title,
    String language,
    String code,
    String expectedOutput,
    String explanation
) {}
