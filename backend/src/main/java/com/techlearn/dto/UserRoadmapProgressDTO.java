package com.techlearn.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoadmapProgressDTO {
    private UUID id;
    private UUID userId;
    private UUID nodeId;
    private String status;
}
