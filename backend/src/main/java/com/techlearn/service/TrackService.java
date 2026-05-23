package com.techlearn.service;

import com.techlearn.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackService {

    @Cacheable("tracks")
    public List<TrackDto> getAllTracks(String email) {
        // In a full implementation, this reads from the `tracks` table
        // and joins with user_progress for the authenticated user.
        return TRACKS;
    }

    public TrackDto getTrack(String trackId, String email) {
        return TRACKS.stream()
                .filter(t -> t.id().equals(trackId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));
    }

    public List<LessonSummaryDto> getLessons(String trackId, String email) {
        // Real impl: SELECT from lessons WHERE track_id = ? ORDER BY lesson_order
        return List.of(
                new LessonSummaryDto("l1", trackId, "Introduction & Setup", "intro", 1, "text", 10, true),
                new LessonSummaryDto("l2", trackId, "Core Concepts", "core-concepts", 2, "text", 20, true),
                new LessonSummaryDto("l3", trackId, "Functions & OOP", "functions", 3, "video", 30, true),
                new LessonSummaryDto("l4", trackId, "Advanced Topics", "advanced", 4, "text", 25, false),
                new LessonSummaryDto("l5", trackId, "Project Walkthrough", "project", 5, "project", 45, false)
        );
    }

    public LessonDetailDto getLesson(String trackId, String lessonId, String email) {
        return new LessonDetailDto(
                lessonId, trackId,
                "Functions & Decorators",
                "functions-decorators",
                3, "text", 30,
                "# Functions & Decorators\n\nIn Python, functions are first-class objects...",
                "Learn how decorators extend function behavior without modifying them.",
                List.of(
                        "Understand functions as first-class objects",
                        "Write and apply decorators",
                        "Use functools.wraps correctly"
                ),
                List.of(
                        new CodeExampleDto("c1", "Basic Decorator", "python",
                                "def my_decorator(func):\n    def wrapper(*args, **kwargs):\n        print('Before')\n        result = func(*args, **kwargs)\n        print('After')\n        return result\n    return wrapper\n\n@my_decorator\ndef greet(name):\n    print(f'Hello, {name}!')\n\ngreet('Alice')",
                                "Before\nHello, Alice!\nAfter",
                                "The @my_decorator syntax wraps greet() with wrapper()"
                        )
                ),
                new QuizDto(List.of(
                        new QuestionDto("q1", "What does @functools.wraps do?",
                                List.of("Speeds up the function", "Preserves the original function's metadata",
                                        "Makes the function thread-safe", "Caches the function's results")),
                        new QuestionDto("q2", "What is the output of @decorator without ()?",
                                List.of("Syntax error", "The decorator receives the function directly",
                                        "The decorator is not applied", "None"))
                ), 70),
                email != null
        );
    }

    public List<LessonSummaryDto> search(String query) {
        // Real impl: full-text search via PostgreSQL tsvector
        return List.of();
    }

    // Static track definitions (move to DB in production)
    private static final List<TrackDto> TRACKS = List.of(
        new TrackDto("python", "Python", "From basics to advanced OOP, decorators, async & data pipelines.",
                "🐍", "#ffd43b", "rgba(255,212,59,.12)", 28, "Beginner", "Core", 20, null),
        new TrackDto("sql", "SQL & Databases", "SQL queries, joins, indexes, NoSQL, PostgreSQL, MongoDB.",
                "🗄️", "#4ade80", "rgba(74,222,128,.12)", 22, "Beginner", "Core", 15, null),
        new TrackDto("ml", "Machine Learning", "Supervised, unsupervised learning, neural nets, model evaluation.",
                "🧠", "#a78bfa", "rgba(167,139,250,.12)", 42, "Intermediate", "AI/ML", 40, null),
        new TrackDto("java", "Java & Spring Boot", "Core Java, OOP, REST APIs with Spring Boot, microservices.",
                "☕", "#f97316", "rgba(249,115,22,.12)", 35, "Intermediate", "Backend", 35, null),
        new TrackDto("cloud", "Cloud & DevOps", "AWS, GCP, Docker, Kubernetes, CI/CD pipelines.",
                "☁️", "#38bdf8", "rgba(56,189,248,.12)", 30, "Intermediate", "Infrastructure", 30, null),
        new TrackDto("nlp", "NLP & AI", "Text processing, sentiment analysis, named entity recognition.",
                "💬", "#f472b6", "rgba(244,114,182,.12)", 32, "Advanced", "AI/ML", 35, null),
        new TrackDto("llm", "Large Language Models", "GPT architecture, fine-tuning, RAG, LangChain, prompt engineering.",
                "✨", "#22d3ee", "rgba(34,211,238,.12)", 25, "Advanced", "AI/ML", 30, null),
        new TrackDto("data-analysis", "Data Analysis", "Pandas, NumPy, Matplotlib, Seaborn, statistical analysis.",
                "📊", "#fb923c", "rgba(251,146,60,.12)", 26, "Beginner", "Data", 25, null)
    );
}
