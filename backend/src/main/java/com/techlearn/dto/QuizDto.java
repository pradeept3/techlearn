package com.techlearn.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDto {
    private List<QuestionDto> questions;
    private int passingScore;
}
