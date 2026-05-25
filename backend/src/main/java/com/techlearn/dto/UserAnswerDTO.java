package com.techlearn.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAnswerDTO {
    private UUID id;
    private UUID questionId;
    private UUID selectedOptionId;
    private String textAnswer;
    private String codeAnswer;
    private Boolean isCorrect;
    private Integer pointsEarned;
    private LocalDateTime createdAt;
}
