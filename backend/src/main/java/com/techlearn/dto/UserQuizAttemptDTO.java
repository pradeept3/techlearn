package com.techlearn.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizAttemptDTO {
    private UUID id;
    private UUID userId;
    private UUID quizId;
    private Integer score;
    private Integer timeTakenSeconds;
    private Boolean isCompleted;
    private Boolean isLatestAttempt;
    private List<UserAnswerDTO> answers;
    private LocalDateTime createdAt;
}
