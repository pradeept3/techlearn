package com.techlearn.service;

import com.techlearn.dto.NoteDto;
import com.techlearn.dto.NoteRequest;
import com.techlearn.model.Note;
import com.techlearn.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;

    public List<NoteDto> getNotes(String trackId) {
        List<Note> notes = trackId == null || trackId.isBlank()
                ? noteRepository.findAll()
                : noteRepository.findByTrackId(trackId);
        return notes.stream().map(this::toDto).collect(Collectors.toList());
    }

    public NoteDto getNote(UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        return toDto(note);
    }

    public NoteDto createNote(NoteRequest request) {
        Note note = Note.builder()
                .title(request.title())
                .trackId(request.trackId())
                .content(request.content())
                .formula(request.formula())
                .backgroundColor(defaultIfNull(request.backgroundColor(), "#fef9c3"))
                .borderColor(defaultIfNull(request.borderColor(), "#fde68a"))
                .textColor(defaultIfNull(request.textColor(), "#78350f"))
                .labelColor(defaultIfNull(request.labelColor(), "#92400e"))
                .isPinned(Boolean.TRUE.equals(request.isPinned()))
                .build();
        return toDto(noteRepository.save(note));
    }

    public NoteDto updateNote(UUID noteId, NoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setTitle(request.title());
        note.setTrackId(request.trackId());
        note.setContent(request.content());
        note.setFormula(request.formula());
        note.setBackgroundColor(defaultIfNull(request.backgroundColor(), note.getBackgroundColor()));
        note.setBorderColor(defaultIfNull(request.borderColor(), note.getBorderColor()));
        note.setTextColor(defaultIfNull(request.textColor(), note.getTextColor()));
        note.setLabelColor(defaultIfNull(request.labelColor(), note.getLabelColor()));
        note.setIsPinned(Boolean.TRUE.equals(request.isPinned()));
        return toDto(noteRepository.save(note));
    }

    public void deleteNote(UUID noteId) {
        noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        noteRepository.deleteById(noteId);
    }

    private NoteDto toDto(Note note) {
        return new NoteDto(
                note.getId(),
                note.getTitle(),
                note.getTrackId(),
                note.getContent(),
                note.getFormula(),
                note.getBackgroundColor(),
                note.getBorderColor(),
                note.getTextColor(),
                note.getLabelColor(),
                note.getIsPinned(),
                note.getCreatedAt()
        );
    }

    private String defaultIfNull(String value, String fallback) {
        return value == null ? fallback : value;
    }
}
