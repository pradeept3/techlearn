package com.techlearn.dto;

import java.util.List;

public record PagedResponse<T>(
    List<T> data,
    long total,
    int page,
    int pageSize,
    int totalPages
) {}
