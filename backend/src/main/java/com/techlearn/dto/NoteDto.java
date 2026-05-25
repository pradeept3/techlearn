package com.techlearn.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NoteDto(
        UUID id,
        String title,
        String trackId,
        String content,
        String formula,
        String backgroundColor,
        String borderColor,
        String textColor,
        String labelColor,
        Boolean isPinned,
        LocalDateTime createdAt
) {
}
