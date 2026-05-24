package com.techlearn.dto;

public record ApiResponse<T>(T data, String message, boolean success) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, true);
    }
    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message, true);
    }
}
