package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    @Column(nullable = false)
    private String questionText;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType;
    
    @Column(nullable = false)
    private Integer questionOrder;
    
    private Integer points = 1;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<QuestionOption> options = new HashSet<>();
    
    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private CodingChallenge codingChallenge;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserAnswer> userAnswers = new HashSet<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
