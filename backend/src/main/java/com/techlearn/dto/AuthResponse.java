package com.techlearn.dto;

import lombok.Builder;

@Builder
public record AuthResponse(
    String token,
    String refreshToken,
    UserDto user
) {
    public record UserDto(
        String id,
        String name,
        String email,
        String avatarUrl,
        String role,
        String createdAt,
        int xp,
        int streak,
        int level
    ) {}
}
