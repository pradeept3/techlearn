package com.techlearn.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapNodeDTO {
    private UUID id;
    private String title;
    private String description;
    private String nodeType;
    private String trackId;
    private Integer positionX;
    private Integer positionY;
    private Boolean isPublished;
    private Set<UUID> prerequisites;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
