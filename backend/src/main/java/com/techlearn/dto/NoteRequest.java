package com.techlearn.dto;

public record NoteRequest(
        String title,
        String trackId,
        String content,
        String formula,
        String backgroundColor,
        String borderColor,
        String textColor,
        String labelColor,
        Boolean isPinned
) {
}
