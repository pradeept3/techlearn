package com.techlearn.service;

import com.techlearn.dto.AuthRequest;
import com.techlearn.dto.AuthResponse;
import com.techlearn.dto.RegisterRequest;
import com.techlearn.model.User;
import com.techlearn.repository.UserRepository;
import com.techlearn.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        var user = User.builder()
            .name(request.name())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .build();

        user = userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());

        return issueTokens(user);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        var user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        log.info("User logged in: {}", user.getEmail());
        return issueTokens(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }
        var email = jwtService.extractUsername(refreshToken);
        var user  = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        return issueTokens(user);
    }

    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
            log.info("User logged out: {}", email);
        });
    }

    public AuthResponse.UserDto getCurrentUser(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toUserDto(user);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private AuthResponse issueTokens(User user) {
        var token        = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(toUserDto(user))
            .build();
    }

    private AuthResponse.UserDto toUserDto(User user) {
        return new AuthResponse.UserDto(
            user.getId().toString(),
            user.getName(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getRole().name().toLowerCase(),
            user.getCreatedAt().toString(),
            user.getXp(),
            user.getStreak(),
            user.getLevel()
        );
    }
}
