package com.techlearn.controller;

import com.techlearn.dto.*;
import com.techlearn.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/progress/me")
    public ResponseEntity<ApiResponse<ProgressSummaryDto>> getMyProgress(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            ApiResponse.ok(progressService.getSummary(user.getUsername()))
        );
    }

    @GetMapping("/progress/track/{trackId}")
    public ResponseEntity<ApiResponse<TrackProgressDto>> getTrackProgress(
            @PathVariable String trackId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            ApiResponse.ok(progressService.getTrackProgress(user.getUsername(), trackId))
        );
    }

    @GetMapping("/progress/streak")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStreak(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            ApiResponse.ok(progressService.getStreakData(user.getUsername()))
        );
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeLesson(
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserDetails user) {
        var result = progressService.completeLesson(user.getUsername(), lessonId);
        return ResponseEntity.ok(ApiResponse.ok(result, "Lesson completed! 🎉"));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard(
            @RequestParam(defaultValue = "week") String period,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            ApiResponse.ok(progressService.getLeaderboard(user.getUsername(), period))
        );
    }

    @GetMapping("/progress/activity")
    public ResponseEntity<ApiResponse<List<DailyActivityDto>>> getActivity(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            ApiResponse.ok(progressService.getActivityData(user.getUsername(), days))
        );
    }
}
