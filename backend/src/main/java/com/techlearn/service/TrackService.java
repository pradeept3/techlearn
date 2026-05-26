package com.techlearn.service;

import com.techlearn.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final List<TrackDto> trackStore = new CopyOnWriteArrayList<>(TRACKS);
    private final Map<String, List<LessonSummaryDto>> lessonStore = new ConcurrentHashMap<>();
    private final Map<String, LessonDetailDto> lessonDetailStore = new ConcurrentHashMap<>();
    private final List<TechnologyDto> technologyStore = new CopyOnWriteArrayList<>(DEFAULT_TECHNOLOGIES);

    public List<TrackDto> getAllTracks(String email) {
        return List.copyOf(trackStore);
    }

    public TrackDto getTrack(String trackId, String email) {
        return trackStore.stream()
                .filter(t -> t.id().equals(trackId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));
    }

    public List<LessonSummaryDto> getLessons(String trackId, String email) {
        return lessonStore.getOrDefault(trackId, DEFAULT_LESSONS_BY_TRACK.getOrDefault(trackId, List.of()));
    }

    public LessonDetailDto getLesson(String trackId, String lessonId, String email) {
        return lessonDetailStore.getOrDefault(
                lessonId,
                DEFAULT_LESSON_DETAILS.getOrDefault(lessonId, DEFAULT_LESSON)
        );
    }

    public List<LessonSummaryDto> search(String query) {
        return List.of();
    }

    public List<TechnologyDto> getAllTechnologies() {
        return List.copyOf(technologyStore);
    }

    public TrackDto createTrack(TrackRequest request) {
        String id = request.id() != null && !request.id().isBlank()
                ? request.id().trim()
                : slugify(request.name());
        if (trackStore.stream().anyMatch(t -> t.id().equals(id))) {
            throw new IllegalArgumentException("Track already exists: " + id);
        }
        TrackDto track = new TrackDto(
                id,
                request.name(),
                request.description(),
                request.icon(),
                request.color(),
                request.bgColor(),
                0,
                request.level(),
                request.tag(),
                request.estimatedHours(),
                null
        );
        trackStore.add(track);
        return track;
    }

    public LessonSummaryDto createLesson(String trackId, LessonRequest request) {
        ensureTrackExists(trackId);
        String lessonId = UUID.randomUUID().toString();
        String slug = request.slug() != null && !request.slug().isBlank()
                ? request.slug().trim()
                : slugify(request.title());
        int order = request.order() != null
                ? request.order()
                : lessonStore.getOrDefault(trackId, DEFAULT_LESSONS_BY_TRACK.getOrDefault(trackId, List.of())).size() + 1;

        LessonSummaryDto summary = new LessonSummaryDto(
                lessonId,
                trackId,
                request.title(),
                slug,
                order,
                request.type(),
                request.durationMinutes(),
                false
        );

        QuizDto quiz = null;
        if (request.quiz() != null) {
            quiz = QuizDto.builder()
                    .questions(request.quiz().questions().stream()
                            .map(question -> new QuestionDto(
                                    UUID.randomUUID().toString(),
                                    question.question(),
                                    List.copyOf(question.options())
                            ))
                            .collect(Collectors.toList()))
                    .passingScore(request.quiz().passingScore())
                    .build();
        }

        LessonDetailDto detail = new LessonDetailDto(
                lessonId,
                trackId,
                request.title(),
                slug,
                order,
                request.type(),
                request.durationMinutes(),
                request.contentMarkdown(),
                request.summary(),
                request.objectives() != null ? List.copyOf(request.objectives()) : List.of(),
                List.of(),
                List.of(),
                quiz,
                false
        );

        lessonStore.computeIfAbsent(trackId, key -> new CopyOnWriteArrayList<>()).add(summary);
        lessonDetailStore.put(lessonId, detail);
        updateTrackLessonCount(trackId, 1);
        return summary;
    }

    public VideoDto addVideoToLesson(String trackId, String lessonId, VideoRequest request) {
        ensureTrackExists(trackId);

        LessonDetailDto existing = lessonDetailStore.get(lessonId);
        if (existing == null) {
            throw new RuntimeException("Lesson not found: " + lessonId);
        }

        List<VideoDto> videos = new ArrayList<>(existing.videos());
        VideoDto video = new VideoDto(
                UUID.randomUUID().toString(),
                request.title(),
                request.description(),
                request.url(),
                request.durationMinutes()
        );
        videos.add(video);

        LessonDetailDto updated = new LessonDetailDto(
                existing.id(),
                existing.trackId(),
                existing.title(),
                existing.slug(),
                existing.order(),
                existing.type(),
                existing.durationMinutes(),
                existing.contentMarkdown(),
                existing.summary(),
                existing.objectives(),
                List.copyOf(videos),
                existing.codeExamples(),
                existing.quiz(),
                existing.completed()
        );

        lessonDetailStore.put(lessonId, updated);
        return video;
    }

    public TechnologyDto createTechnology(TechnologyRequest request) {
        String id = slugify(request.name());
        if (technologyStore.stream().anyMatch(t -> t.id().equals(id))) {
            throw new IllegalArgumentException("Technology already exists: " + request.name());
        }
        TechnologyDto technology = new TechnologyDto(
                id,
                request.name(),
                request.category(),
                request.description(),
                request.icon()
        );
        technologyStore.add(technology);
        return technology;
    }

    private void ensureTrackExists(String trackId) {
        if (trackStore.stream().noneMatch(t -> t.id().equals(trackId))) {
            throw new IllegalArgumentException("Track not found: " + trackId);
        }
    }

    private void updateTrackLessonCount(String trackId, int delta) {
        for (int i = 0; i < trackStore.size(); i++) {
            TrackDto track = trackStore.get(i);
            if (track.id().equals(trackId)) {
                TrackDto updated = new TrackDto(
                        track.id(),
                        track.name(),
                        track.description(),
                        track.icon(),
                        track.color(),
                        track.bgColor(),
                        track.totalLessons() + delta,
                        track.level(),
                        track.tag(),
                        track.estimatedHours(),
                        track.userProgressPercent()
                );
                trackStore.set(i, updated);
                return;
            }
        }
    }

    private String slugify(String value) {
        if (value == null || value.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? UUID.randomUUID().toString() : normalized;
    }

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

    private static final Map<String, List<LessonSummaryDto>> DEFAULT_LESSONS_BY_TRACK = Map.ofEntries(
            Map.entry("python", List.of(
                    new LessonSummaryDto("l1", "python", "Introduction & Setup", "intro", 1, "text", 10, true),
                    new LessonSummaryDto("l2", "python", "Core Concepts", "core-concepts", 2, "text", 20, true),
                    new LessonSummaryDto("l3", "python", "Functions & OOP", "functions", 3, "video", 30, true),
                    new LessonSummaryDto("l4", "python", "Advanced Topics", "advanced", 4, "text", 25, false),
                    new LessonSummaryDto("l5", "python", "Project Walkthrough", "project", 5, "project", 45, false)
            )),
            Map.entry("sql", List.of(
                    new LessonSummaryDto("sql1", "sql", "Relational Data Modeling", "relational-data-modeling", 1, "text", 20, true),
                    new LessonSummaryDto("sql2", "sql", "Joins & Performance", "joins-performance", 2, "text", 25, false)
            )),
            Map.entry("ml", List.of(
                    new LessonSummaryDto("ml1", "ml", "Model Training Workflow", "model-training-workflow", 1, "text", 25, true),
                    new LessonSummaryDto("ml2", "ml", "Evaluation Metrics", "evaluation-metrics", 2, "text", 30, false)
            )),
            Map.entry("java", List.of(
                    new LessonSummaryDto("java1", "java", "Spring Boot REST APIs", "spring-boot-rest-apis", 1, "text", 30, true),
                    new LessonSummaryDto("java2", "java", "Dependency Injection", "dependency-injection", 2, "text", 25, false)
            )),
            Map.entry("cloud", List.of(
                    new LessonSummaryDto("cloud1", "cloud", "Docker Containers", "docker-containers", 1, "text", 20, true),
                    new LessonSummaryDto("cloud2", "cloud", "CI/CD Fundamentals", "cicd-fundamentals", 2, "text", 25, false)
            )),
            Map.entry("nlp", List.of(
                    new LessonSummaryDto("nlp1", "nlp", "Text Preprocessing", "text-preprocessing", 1, "text", 20, true),
                    new LessonSummaryDto("nlp2", "nlp", "Named Entity Recognition", "named-entity-recognition", 2, "text", 30, false)
            )),
            Map.entry("llm", List.of(
                    new LessonSummaryDto("llm1", "llm", "Prompt Engineering Best Practices", "prompt-engineering", 1, "text", 25, true),
                    new LessonSummaryDto("llm2", "llm", "RAG with Large Language Models", "rag-with-llms", 2, "text", 30, false)
            )),
            Map.entry("data-analysis", List.of(
                    new LessonSummaryDto("da1", "data-analysis", "Pandas DataFrames", "pandas-dataframes", 1, "text", 25, true),
                    new LessonSummaryDto("da2", "data-analysis", "Data Visualization with Matplotlib", "data-visualization", 2, "text", 30, false)
            ))
    );

    private static final Map<String, LessonDetailDto> DEFAULT_LESSON_DETAILS = Map.ofEntries(
            Map.entry("l1", new LessonDetailDto(
                    "l1",
                    "python",
                    "Introduction & Setup",
                    "intro",
                    1,
                    "text",
                    10,
                    "# Introduction & Setup\n\nWelcome to the Python track. This lesson covers the environment setup and the core language features.",
                    "Get started with Python and the development environment.",
                    List.of(
                            "Install Python and tooling",
                            "Understand the Python execution model",
                            "Run simple Python scripts"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("l2", new LessonDetailDto(
                    "l2",
                    "python",
                    "Core Concepts",
                    "core-concepts",
                    2,
                    "text",
                    20,
                    "# Core Concepts\n\nLearn about variables, data types, control flow, and functions in Python.",
                    "Build a strong foundation in Python basics.",
                    List.of(
                            "Use variables and built-in types",
                            "Write conditional logic",
                            "Define and call functions"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("l3", new LessonDetailDto(
                    "l3",
                    "python",
                    "Functions & Decorators",
                    "functions-decorators",
                    3,
                    "text",
                    30,
                    "# Functions & Decorators\n\nIn Python, functions are first-class objects...",
                    "Learn how decorators extend function behavior without modifying them.",
                    List.of(
                            "Understand functions as first-class objects",
                            "Write and apply decorators",
                            "Use functools.wraps correctly"
                    ),
                    List.of(
                            new VideoDto("v1", "Decorators Explained", "A short video on Python decorators.", "https://example.com/decorators.mp4", 8)
                    ),
                    List.of(
                            new CodeExampleDto("c1", "Basic Decorator", "python",
                                    "def my_decorator(func):\n    def wrapper(*args, **kwargs):\n        print('Before')\n        result = func(*args, **kwargs)\n        print('After')\n        return result\n    return wrapper\n\n@my_decorator\ndef greet(name):\n    print(f'Hello, {name}!')\n\ngreet('Alice')",
                                    "Before\nHello, Alice!\nAfter",
                                    "The @my_decorator syntax wraps greet() with wrapper()"
                            )
                    ),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("q1", "What does @functools.wraps do?",
                                            List.of("Speeds up the function", "Preserves the original function's metadata",
                                                    "Makes the function thread-safe", "Caches the function's results")),
                                    new QuestionDto("q2", "What is the output of @decorator without ()?",
                                            List.of("Syntax error", "The decorator receives the function directly",
                                                    "The decorator is not applied", "None"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("l4", new LessonDetailDto(
                    "l4",
                    "python",
                    "Advanced Topics",
                    "advanced",
                    4,
                    "text",
                    25,
                    "# Advanced Topics\n\nExplore generators, context managers, and async programming in Python.",
                    "Prepare for advanced Python patterns and libraries.",
                    List.of(
                            "Use generators for memory-efficient iteration",
                            "Implement context managers with __enter__/__exit__",
                            "Write asynchronous code with async/await"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("l5", new LessonDetailDto(
                    "l5",
                    "python",
                    "Project Walkthrough",
                    "project",
                    5,
                    "project",
                    45,
                    "# Project Walkthrough\n\nBuild a small end-to-end Python project with testing and deployment notes.",
                    "Complete a practical Python project and review best practices.",
                    List.of(
                            "Design a small project structure",
                            "Write tests for Python code",
                            "Prepare code for deployment"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("sql1", new LessonDetailDto(
                    "sql1",
                    "sql",
                    "Relational Data Modeling",
                    "relational-data-modeling",
                    1,
                    "text",
                    20,
                    "# Relational Data Modeling\n\nDesign tables, normalize data, and define relationships for a SQL database.",
                    "Learn how to structure data in a relational schema.",
                    List.of(
                            "Define tables and primary keys",
                            "Model one-to-many and many-to-many relationships",
                            "Apply normalization rules"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("sql-q1", "What is first normal form (1NF)?",
                                            List.of("Tables must be sorted", "Each field must contain atomic values",
                                                    "Indexes are required", "Data must be encrypted")),
                                    new QuestionDto("sql-q2", "Which relationship uses a join table?",
                                            List.of("One-to-one", "One-to-many", "Many-to-many", "Self-join"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("sql2", new LessonDetailDto(
                    "sql2",
                    "sql",
                    "Joins & Performance",
                    "joins-performance",
                    2,
                    "text",
                    25,
                    "# Joins & Performance\n\nUse INNER JOIN, LEFT JOIN, and indexes to optimize query performance.",
                    "Write efficient SQL queries using joins and indexes.",
                    List.of(
                            "Differentiate INNER and OUTER joins",
                            "Use indexes to speed up queries",
                            "Analyze query plans"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("ml1", new LessonDetailDto(
                    "ml1",
                    "ml",
                    "Model Training Workflow",
                    "model-training-workflow",
                    1,
                    "text",
                    25,
                    "# Model Training Workflow\n\nLearn how to prepare data, choose models, and run training experiments.",
                    "Understand the core steps of training machine learning models.",
                    List.of(
                            "Split data into train/validation/test",
                            "Choose appropriate model types",
                            "Track training metrics"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("ml-q1", "What is overfitting?",
                                            List.of("Model too simple", "Model performs well on training data but poorly on new data",
                                                    "Model is too slow", "Model has too few features")),
                                    new QuestionDto("ml-q2", "Which metric is best for imbalanced classification?",
                                            List.of("Accuracy", "F1 score", "Mean squared error", "R-squared"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("ml2", new LessonDetailDto(
                    "ml2",
                    "ml",
                    "Evaluation Metrics",
                    "evaluation-metrics",
                    2,
                    "text",
                    30,
                    "# Evaluation Metrics\n\nCompare precision, recall, F1 score, and ROC AUC for model selection.",
                    "Choose the right evaluation metrics for your model.",
                    List.of(
                            "Understand precision and recall",
                            "Interpret confusion matrices",
                            "Use ROC AUC for ranking problems"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("java1", new LessonDetailDto(
                    "java1",
                    "java",
                    "Spring Boot REST APIs",
                    "spring-boot-rest-apis",
                    1,
                    "text",
                    30,
                    "# Spring Boot REST APIs\n\nBuild REST endpoints, use controllers, and handle JSON payloads in Spring Boot.",
                    "Create RESTful services with Spring Boot.",
                    List.of(
                            "Define REST controllers",
                            "Work with request/response bodies",
                            "Use dependency injection"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("java-q1", "What annotation defines a REST controller?",
                                            List.of("@Controller", "@RestController", "@Service", "@Repository")),
                                    new QuestionDto("java-q2", "Which HTTP method is usually used to create a resource?",
                                            List.of("GET", "PUT", "POST", "DELETE"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("java2", new LessonDetailDto(
                    "java2",
                    "java",
                    "Dependency Injection",
                    "dependency-injection",
                    2,
                    "text",
                    25,
                    "# Dependency Injection\n\nUnderstand how Spring injects beans and manages object lifecycles.",
                    "Use DI patterns in Spring Boot applications.",
                    List.of(
                            "Apply @Autowired and constructor injection",
                            "Use @Component and @Service beans",
                            "Manage bean scopes"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("cloud1", new LessonDetailDto(
                    "cloud1",
                    "cloud",
                    "Docker Containers",
                    "docker-containers",
                    1,
                    "text",
                    20,
                    "# Docker Containers\n\nExplore container basics, Dockerfiles, and running apps inside containers.",
                    "Learn how to package applications with Docker.",
                    List.of(
                            "Write a Dockerfile",
                            "Build and run Docker images",
                            "Understand container isolation"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("cloud-q1", "What command builds a Docker image?",
                                            List.of("docker run", "docker build", "docker compose", "docker pull")),
                                    new QuestionDto("cloud-q2", "Which file defines container configuration?",
                                            List.of("package.json", "requirements.txt", "Dockerfile", "README.md"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("cloud2", new LessonDetailDto(
                    "cloud2",
                    "cloud",
                    "CI/CD Fundamentals",
                    "cicd-fundamentals",
                    2,
                    "text",
                    25,
                    "# CI/CD Fundamentals\n\nUnderstand pipelines, automated tests, and deployment workflows.",
                    "Implement a basic CI/CD workflow for software delivery.",
                    List.of(
                            "Describe CI/CD concepts",
                            "Automate tests and builds",
                            "Deploy code changes safely"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("nlp1", new LessonDetailDto(
                    "nlp1",
                    "nlp",
                    "Text Preprocessing",
                    "text-preprocessing",
                    1,
                    "text",
                    20,
                    "# Text Preprocessing\n\nClean text data, tokenize, normalize, and prepare it for NLP models.",
                    "Prepare raw text for NLP pipelines.",
                    List.of(
                            "Remove stop words and punctuation",
                            "Apply tokenization",
                            "Use stemming and lemmatization"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("nlp-q1", "What is tokenization?",
                                            List.of("Splitting text into words or tokens", "Translating text", "Encrypting text", "Removing punctuation")),
                                    new QuestionDto("nlp-q2", "What does lemmatization do?",
                                            List.of("Removes vowels", "Finds the base form of words", "Counts word frequency", "Sorts tokens alphabetically"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("nlp2", new LessonDetailDto(
                    "nlp2",
                    "nlp",
                    "Named Entity Recognition",
                    "named-entity-recognition",
                    2,
                    "text",
                    30,
                    "# Named Entity Recognition\n\nExtract people, organizations, and locations from text data.",
                    "Use NER to identify entities in text.",
                    List.of(
                            "Understand entity categories",
                            "Train or use pretrained NER models",
                            "Evaluate NER results"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("llm1", new LessonDetailDto(
                    "llm1",
                    "llm",
                    "Prompt Engineering Best Practices",
                    "prompt-engineering",
                    1,
                    "text",
                    25,
                    "# Prompt Engineering Best Practices\n\nWrite clear prompts, provide examples, and refine outputs for large language models.",
                    "Create prompts that produce better LLM responses.",
                    List.of(
                            "Use explicit instructions",
                            "Include examples and constraints",
                            "Iterate on prompt wording"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("llm-q1", "Which prompt style helps produce consistent outputs?",
                                            List.of("Vague requests", "One-word prompts", "Few-shot examples", "No context")),
                                    new QuestionDto("llm-q2", "What should you include for a data transformation prompt?",
                                            List.of("Only the output format", "Input examples and desired output", "Random values", "No examples"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("llm2", new LessonDetailDto(
                    "llm2",
                    "llm",
                    "RAG with Large Language Models",
                    "rag-with-llms",
                    2,
                    "text",
                    30,
                    "# RAG with Large Language Models\n\nCombine retrieval with LLM generation to answer questions from a document collection.",
                    "Implement retrieval-augmented generation workflows.",
                    List.of(
                            "Index documents for retrieval",
                            "Use embeddings to find relevant context",
                            "Merge retrieved text into prompts"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            )),
            Map.entry("da1", new LessonDetailDto(
                    "da1",
                    "data-analysis",
                    "Pandas DataFrames",
                    "pandas-dataframes",
                    1,
                    "text",
                    25,
                    "# Pandas DataFrames\n\nLearn how to load, inspect, and manipulate tabular data using Pandas.",
                    "Work with datasets using DataFrames.",
                    List.of(
                            "Load CSV files into DataFrames",
                            "Filter and aggregate data",
                            "Handle missing values"
                    ),
                    List.of(),
                    List.of(),
                    QuizDto.builder()
                            .questions(List.of(
                                    new QuestionDto("da-q1", "Which method loads a CSV into a DataFrame?",
                                            List.of("pd.save_csv", "pd.read_csv", "pd.load_data", "pd.parse_csv")),
                                    new QuestionDto("da-q2", "How do you select a column in Pandas?",
                                            List.of("df.column", "df['column']", "df.column()", "df[[column]]"))
                            ))
                            .passingScore(70)
                            .build(),
                    false
            )),
            Map.entry("da2", new LessonDetailDto(
                    "da2",
                    "data-analysis",
                    "Data Visualization with Matplotlib",
                    "data-visualization",
                    2,
                    "text",
                    30,
                    "# Data Visualization with Matplotlib\n\nCreate charts, configure plots, and communicate insights visually.",
                    "Build effective charts with Matplotlib.",
                    List.of(
                            "Plot line and bar charts",
                            "Customize axes and legends",
                            "Save figures to files"
                    ),
                    List.of(),
                    List.of(),
                    null,
                    false
            ))
    );

    private static final LessonDetailDto DEFAULT_LESSON = DEFAULT_LESSON_DETAILS.get("l3");

    private static final List<TechnologyDto> DEFAULT_TECHNOLOGIES = List.of(
            new TechnologyDto("python", "Python", "Programming Language", "A versatile language for web, data science, automation, and AI.", "🐍"),
            new TechnologyDto("java", "Java", "Programming Language", "Robust backend and enterprise systems using Spring Boot.", "☕"),
            new TechnologyDto("sql", "SQL", "Database", "Structured query language for relational databases and analytics.", "🗄️"),
            new TechnologyDto("cloud", "Cloud", "Infrastructure", "Cloud platforms like AWS, GCP, and Azure for modern deployments.", "☁️"),
            new TechnologyDto("ml", "Machine Learning", "AI/ML", "Algorithms and models for prediction, classification, and analysis.", "🧠"),
            new TechnologyDto("nlp", "NLP", "AI/ML", "Natural Language Processing techniques like tokenization, NER, and text embeddings.", "💬"),
            new TechnologyDto("llm", "LLM", "AI/ML", "Large Language Models, prompt engineering, and retrieval-augmented generation.", "✨"),
            new TechnologyDto("data-analysis", "Data Analysis", "Data", "Pandas, NumPy, Matplotlib, and statistical analysis for data-driven decisions.", "📊")
    );
}
