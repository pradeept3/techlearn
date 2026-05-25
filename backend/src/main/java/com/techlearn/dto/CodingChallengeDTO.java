package com.techlearn.dto;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingChallengeDTO {
    private UUID id;
    private String language;
    private String starterCode;
    private String expectedOutput;
    private List<Map<String, Object>> testCases;
    private String solutionCode;
}
