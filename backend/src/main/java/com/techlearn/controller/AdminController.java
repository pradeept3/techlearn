package com.techlearn.controller;

import com.techlearn.dto.*;
import com.techlearn.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TrackService trackService;

    @PostMapping("/tracks")
    public ResponseEntity<ApiResponse<TrackDto>> createTrack(@RequestBody TrackRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(trackService.createTrack(request)));
    }

    @PostMapping("/tracks/{trackId}/lessons")
    public ResponseEntity<ApiResponse<LessonSummaryDto>> createLesson(
            @PathVariable String trackId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(trackService.createLesson(trackId, request)));
    }

    @PostMapping("/tracks/{trackId}/lessons/{lessonId}/videos")
    public ResponseEntity<ApiResponse<VideoDto>> addVideo(
            @PathVariable String trackId,
            @PathVariable String lessonId,
            @RequestBody VideoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(trackService.addVideoToLesson(trackId, lessonId, request)));
    }

    @PostMapping("/technologies")
    public ResponseEntity<ApiResponse<TechnologyDto>> addTechnology(@RequestBody TechnologyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(trackService.createTechnology(request)));
    }
}
