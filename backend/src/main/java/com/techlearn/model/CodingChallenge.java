package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coding_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingChallenge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;
    
    @Column(nullable = false)
    private String language;
    
    @Column(columnDefinition = "TEXT")
    private String starterCode;
    
    @Column(columnDefinition = "TEXT")
    private String expectedOutput;
    
    @Column(columnDefinition = "jsonb")
    private String testCases;
    
    @Column(columnDefinition = "TEXT")
    private String solutionCode;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
