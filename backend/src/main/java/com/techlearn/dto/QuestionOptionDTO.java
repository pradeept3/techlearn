package com.techlearn.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOptionDTO {
    private UUID id;
    private String text;
    private Integer optionOrder;
    private Boolean isCorrect;
}
