package com.techlearn.controller;

import com.techlearn.dto.*;
import com.techlearn.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    @GetMapping("/tracks")
    public ResponseEntity<ApiResponse<List<TrackDto>>> getAllTracks(
            @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.ok(trackService.getAllTracks(email)));
    }

    @GetMapping("/tracks/{trackId}")
    public ResponseEntity<ApiResponse<TrackDto>> getTrack(
            @PathVariable String trackId,
            @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.ok(trackService.getTrack(trackId, email)));
    }

    @GetMapping("/tracks/{trackId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonSummaryDto>>> getLessons(
            @PathVariable String trackId,
            @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.ok(trackService.getLessons(trackId, email)));
    }

    @GetMapping("/tracks/{trackId}/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonDetailDto>> getLesson(
            @PathVariable String trackId,
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.ok(trackService.getLesson(trackId, lessonId, email)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<LessonSummaryDto>>> search(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(trackService.search(q)));
    }
}
