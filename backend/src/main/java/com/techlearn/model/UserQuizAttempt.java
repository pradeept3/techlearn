package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "user_quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    private Integer score;
    
    private Integer totalPoints;
    
    private Long timeTakenSeconds;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProgressStatus status = ProgressStatus.IN_PROGRESS;
    
    @Column(nullable = false)
    private Boolean isLatestAttempt = true;
    
    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserAnswer> userAnswers = new HashSet<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
}
