package com.techlearn.service;

import com.techlearn.dto.*;
import com.techlearn.model.User;
import com.techlearn.model.UserProgress;
import com.techlearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProgressService {

    private final UserRepository userRepository;

    private static final int XP_PER_LESSON = 50;
    private static final int XP_STREAK_BONUS = 10;

    public ProgressSummaryDto getSummary(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new ProgressSummaryDto(
                getTrackProgressList(user),
                user.getXp(),
                user.getStreak(),
                user.getStreak(), // longestStreak — track separately if needed
                countCompletedLessons(user),
                getWeeklyActivity(user)
        );
    }

    public TrackProgressDto getTrackProgress(String email, String trackId) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildTrackProgressDto(user, trackId);
    }

    @CacheEvict(value = "leaderboard", allEntries = true)
    public Map<String, Object> completeLesson(String email, String lessonId) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Award XP
        int xpGained = XP_PER_LESSON;

        // Streak logic
        LocalDate today = LocalDate.now();
        boolean streakMaintained = false;
        if (user.getLastActiveAt() != null) {
            LocalDate lastActive = user.getLastActiveAt().toLocalDate();
            if (lastActive.equals(today.minusDays(1))) {
                user.setStreak(user.getStreak() + 1);
                xpGained += XP_STREAK_BONUS * Math.min(user.getStreak(), 10);
                streakMaintained = true;
            } else if (!lastActive.equals(today)) {
                user.setStreak(1);
            }
        } else {
            user.setStreak(1);
        }

        user.addXp(xpGained);
        user.setLastActiveAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Lesson completed", email=email, lessonId=lessonId, xpGained=xpGained);

        return Map.of(
                "xpGained", xpGained,
                "totalXp", user.getXp(),
                "level", user.getLevel(),
                "streak", user.getStreak(),
                "streakMaintained", streakMaintained,
                "leveledUp", user.getXp() / 500 != (user.getXp() - xpGained) / 500
        );
    }

    @Cacheable("leaderboard")
    public List<LeaderboardEntryDto> getLeaderboard(String currentEmail, String period) {
        var topUsers = userRepository.findTopByXp(10);
        int[] rank = {1};

        return topUsers.stream()
                .map(u -> new LeaderboardEntryDto(
                        rank[0]++,
                        u.getId().toString(),
                        u.getName(),
                        u.getAvatarUrl(),
                        u.getXp(),
                        u.getStreak(),
                        u.getEmail().equals(currentEmail)
                ))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStreakData(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate last 30 days activity (placeholder — real impl reads daily_activity table)
        List<Map<String, Object>> activity = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            boolean active = i < user.getStreak();
            activity.add(Map.of(
                    "date", date.toString(),
                    "active", active,
                    "isToday", i == 0
            ));
        }

        return Map.of(
                "currentStreak", user.getStreak(),
                "longestStreak", user.getStreak(),
                "dailyActivity", activity
        );
    }

    public List<DailyActivityDto> getActivityData(String email, int days) {
        // Placeholder — real impl queries daily_activity table
        List<DailyActivityDto> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random rng = new Random(email.hashCode());

        for (int i = days - 1; i >= 0; i--) {
            boolean active = rng.nextDouble() > 0.4;
            result.add(new DailyActivityDto(
                    today.minusDays(i).toString(),
                    active ? 15 + rng.nextInt(50) : 0,
                    active ? rng.nextInt(3) + 1 : 0
            ));
        }
        return result;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private List<TrackProgressDto> getTrackProgressList(User user) {
        // Placeholder — real impl joins user_progress table
        return List.of(
                new TrackProgressDto("python", 25, 350, 7, 28, LocalDateTime.now().minusDays(1).toString()),
                new TrackProgressDto("ml", 7, 150, 3, 42, LocalDateTime.now().minusDays(2).toString())
        );
    }

    private TrackProgressDto buildTrackProgressDto(User user, String trackId) {
        return new TrackProgressDto(trackId, 0, 0, 0, 0, null);
    }

    private int countCompletedLessons(User user) {
        return 24; // placeholder
    }

    private List<DailyActivityDto> getWeeklyActivity(User user) {
        return getActivityData(user.getEmail(), 7);
    }
}
