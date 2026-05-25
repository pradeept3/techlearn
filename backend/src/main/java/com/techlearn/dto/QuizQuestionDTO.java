package com.techlearn.dto;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionDTO {
    private UUID id;
    private String text;
    private String questionType;
    private Integer questionOrder;
    private Integer points;
    private String explanation;
    private List<QuestionOptionDTO> options;
    private CodingChallengeDTO codingChallenge;
}
