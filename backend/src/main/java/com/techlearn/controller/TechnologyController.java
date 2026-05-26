package com.techlearn.controller;

import com.techlearn.dto.ApiResponse;
import com.techlearn.dto.TechnologyDto;
import com.techlearn.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TechnologyController {

    private final TrackService trackService;

    @GetMapping("/technologies")
    public ResponseEntity<ApiResponse<List<TechnologyDto>>> getTechnologies() {
        return ResponseEntity.ok(ApiResponse.ok(trackService.getAllTechnologies()));
    }
}
