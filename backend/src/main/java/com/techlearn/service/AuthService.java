package com.techlearn.service;

import com.techlearn.dto.AuthRequest;
import com.techlearn.dto.AuthResponse;
import com.techlearn.dto.RegisterRequest;
import com.techlearn.model.User;
import com.techlearn.repository.UserRepository;
import com.techlearn.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        var user = User.builder()
            .name(request.name())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .build();

        user = userRepository.save(user);

        var token = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return buildAuthResponse(user, token, refreshToken);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        var user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var token = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return buildAuthResponse(user, token, refreshToken);
    }

    public AuthResponse refreshToken(String refreshToken) {
        var email = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        var newToken = jwtService.generateToken(user);
        var newRefresh = jwtService.generateRefreshToken(user);
        user.setRefreshToken(newRefresh);
        userRepository.save(user);

        return buildAuthResponse(user, newToken, newRefresh);
    }

    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    public AuthResponse.UserDto getCurrentUser(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toUserDto(user);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
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
