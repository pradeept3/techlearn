package com.techlearn.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String trackId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String formula;

    @Column(nullable = false)
    private String backgroundColor = "#fef9c3";

    @Column(nullable = false)
    private String borderColor = "#fde68a";

    @Column(nullable = false)
    private String textColor = "#78350f";

    @Column(nullable = false)
    private String labelColor = "#92400e";

    @Column(nullable = false)
    private Boolean isPinned = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
