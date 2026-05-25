package com.techlearn.controller;

import com.techlearn.dto.ApiResponse;
import com.techlearn.model.*;
import com.techlearn.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    // ── Roadmap listing ───────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<Roadmap>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.getAllRoadmaps()));
    }

    @GetMapping("/{roadmapId}")
    public ResponseEntity<ApiResponse<Roadmap>> getOne(@PathVariable UUID roadmapId) {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.getRoadmap(roadmapId)));
    }

    // ── User progress ─────────────────────────────────────────────────────────

    @GetMapping("/{roadmapId}/progress")
    public ResponseEntity<ApiResponse<UserRoadmapProgress>> getProgress(
            @PathVariable UUID roadmapId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.getProgress(userId, roadmapId)
        ));
    }

    @PostMapping("/{roadmapId}/enroll")
    public ResponseEntity<ApiResponse<UserRoadmapProgress>> enroll(
            @PathVariable UUID roadmapId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.enroll(userId, roadmapId),
            "Enrolled successfully!"
        ));
    }

    // ── Node transitions ──────────────────────────────────────────────────────

    @PostMapping("/{roadmapId}/nodes/{nodeId}/start")
    public ResponseEntity<ApiResponse<UserNodeProgress>> startNode(
            @PathVariable UUID roadmapId,
            @PathVariable UUID nodeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.startNode(userId, roadmapId, nodeId)
        ));
    }

    @PostMapping("/{roadmapId}/nodes/{nodeId}/complete")
    public ResponseEntity<ApiResponse<UserNodeProgress>> completeNode(
            @PathVariable UUID roadmapId,
            @PathVariable UUID nodeId,
            @RequestBody(required = false) Map<String, Integer> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        int score   = body != null ? body.getOrDefault("score", 100) : 100;
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.completeNode(userId, roadmapId, nodeId, score),
            "Node completed! 🎉"
        ));
    }

    @PostMapping("/{roadmapId}/nodes/{nodeId}/fail")
    public ResponseEntity<ApiResponse<UserNodeProgress>> failNode(
            @PathVariable UUID roadmapId,
            @PathVariable UUID nodeId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        int score   = body.getOrDefault("score", 0);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.failNode(userId, roadmapId, nodeId, score)
        ));
    }

    @PostMapping("/{roadmapId}/nodes/{nodeId}/skip")
    public ResponseEntity<ApiResponse<UserNodeProgress>> skipNode(
            @PathVariable UUID roadmapId,
            @PathVariable UUID nodeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.skipNode(userId, roadmapId, nodeId)
        ));
    }

    @PatchMapping("/{roadmapId}/nodes/{nodeId}/progress")
    public ResponseEntity<ApiResponse<UserNodeProgress>> updateNodeProgress(
            @PathVariable UUID roadmapId,
            @PathVariable UUID nodeId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        int percent = body.getOrDefault("percent", 0);
        return ResponseEntity.ok(ApiResponse.ok(
            roadmapService.updateNodeProgress(userId, roadmapId, nodeId, percent)
        ));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private UUID extractUserId(UserDetails userDetails) {
        // UserDetails.getUsername() returns the email.
        // In a real implementation inject UserRepository and look up the UUID.
        // Placeholder — returns a fixed UUID for compilation.
        return UUID.nameUUIDFromBytes(userDetails.getUsername().getBytes());
    }
}
