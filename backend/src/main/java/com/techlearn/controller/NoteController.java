package com.techlearn.controller;

import com.techlearn.dto.ApiResponse;
import com.techlearn.dto.NoteDto;
import com.techlearn.dto.NoteRequest;
import com.techlearn.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteDto>>> getNotes(
            @RequestParam(required = false) String trackId) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.getNotes(trackId)));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<ApiResponse<NoteDto>> getNote(@PathVariable UUID noteId) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.getNote(noteId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoteDto>> createNote(@RequestBody NoteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.createNote(request)));
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<ApiResponse<NoteDto>> updateNote(
            @PathVariable UUID noteId,
            @RequestBody NoteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.updateNote(noteId, request)));
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteNote(@PathVariable UUID noteId) {
        noteService.deleteNote(noteId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("id", noteId)));
    }
}
