package com.techlearn.controller;

import com.techlearn.dto.*;
import com.techlearn.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDto> getQuiz(@PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getQuiz(quizId));
    }
    
    @GetMapping("/track/{trackId}")
    public ResponseEntity<List<QuizDto>> getQuizzesByTrack(@PathVariable String trackId) {
        return ResponseEntity.ok(quizService.getQuizzesByTrack(trackId));
    }
    
    @PostMapping("/{quizId}/start")
    public ResponseEntity<UserQuizAttemptDTO> startQuizAttempt(
            @PathVariable UUID quizId,
            @RequestHeader("User-ID") UUID userId) {
        return ResponseEntity.ok(quizService.startQuizAttempt(userId, quizId));
    }
    
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<UserQuizAttemptDTO> submitQuizAttempt(
            @PathVariable UUID quizId,
            @RequestHeader("User-ID") UUID userId,
            @RequestBody Map<String, Object> answers) {
        return ResponseEntity.ok(quizService.submitQuizAttempt(userId, quizId, answers));
    }
    
    @GetMapping("/{quizId}/attempts")
    public ResponseEntity<List<UserQuizAttemptDTO>> getUserAttempts(
            @PathVariable UUID quizId,
            @RequestHeader("User-ID") UUID userId) {
        return ResponseEntity.ok(quizService.getUserAttempts(userId, quizId));
    }
    
    @GetMapping("/{quizId}/latest-attempt")
    public ResponseEntity<UserQuizAttemptDTO> getLatestAttempt(
            @PathVariable UUID quizId,
            @RequestHeader("User-ID") UUID userId) {
        return ResponseEntity.ok(quizService.getLatestAttempt(userId, quizId));
    }
}
