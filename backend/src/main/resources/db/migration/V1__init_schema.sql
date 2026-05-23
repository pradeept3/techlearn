-- V1__init_schema.sql
-- TechLearn initial database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(20)     NOT NULL DEFAULT 'STUDENT',
    xp              INT             NOT NULL DEFAULT 0,
    streak          INT             NOT NULL DEFAULT 0,
    level           INT             NOT NULL DEFAULT 1,
    last_active_at  TIMESTAMP,
    refresh_token   TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─── Tracks (seeded via data.sql) ────────────────────────────────────────────
CREATE TABLE tracks (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT            NOT NULL,
    icon            VARCHAR(50)     NOT NULL,
    color           VARCHAR(20)     NOT NULL,
    bg_color        VARCHAR(40)     NOT NULL,
    level           VARCHAR(20)     NOT NULL,
    tag             VARCHAR(30)     NOT NULL,
    estimated_hours INT             NOT NULL DEFAULT 10,
    is_published    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ─── Lessons ──────────────────────────────────────────────────────────────────
CREATE TABLE lessons (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id        VARCHAR(50)     NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    slug            VARCHAR(200)    NOT NULL,
    lesson_order    INT             NOT NULL,
    type            VARCHAR(20)     NOT NULL DEFAULT 'text', -- text|video|quiz|project
    duration_minutes INT            NOT NULL DEFAULT 15,
    content_markdown TEXT           NOT NULL DEFAULT '',
    summary         TEXT,
    objectives      TEXT[],
    xp_reward       INT             NOT NULL DEFAULT 50,
    is_published    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE(track_id, lesson_order),
    UNIQUE(track_id, slug)
);

CREATE INDEX idx_lessons_track ON lessons(track_id);

-- ─── Code Examples ────────────────────────────────────────────────────────────
CREATE TABLE code_examples (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id       UUID            NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    language        VARCHAR(30)     NOT NULL,
    code            TEXT            NOT NULL,
    expected_output TEXT,
    explanation     TEXT,
    example_order   INT             NOT NULL DEFAULT 0
);

-- ─── Quiz Questions ───────────────────────────────────────────────────────────
CREATE TABLE quiz_questions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id       UUID            NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question        TEXT            NOT NULL,
    options         TEXT[]          NOT NULL,
    correct_index   INT             NOT NULL,
    explanation     TEXT,
    question_order  INT             NOT NULL DEFAULT 0
);

-- ─── User Progress ────────────────────────────────────────────────────────────
CREATE TABLE user_progress (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id            VARCHAR(50) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    current_lesson_id   UUID        REFERENCES lessons(id),
    progress_percent    INT         NOT NULL DEFAULT 0,
    xp_earned           INT         NOT NULL DEFAULT 0,
    started_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    last_activity_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

CREATE TABLE completed_lessons (
    progress_id     UUID    NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
    lesson_id       UUID    NOT NULL,
    completed_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (progress_id, lesson_id)
);

-- ─── Daily Activity ───────────────────────────────────────────────────────────
CREATE TABLE daily_activity (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date       DATE        NOT NULL,
    minutes_learned     INT         NOT NULL DEFAULT 0,
    lessons_completed   INT         NOT NULL DEFAULT 0,
    UNIQUE(user_id, activity_date)
);

-- ─── Case Studies ─────────────────────────────────────────────────────────────
CREATE TABLE case_studies (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(300) NOT NULL,
    company             VARCHAR(100),
    track_id            VARCHAR(50)  REFERENCES tracks(id),
    tag                 VARCHAR(50),
    description         TEXT        NOT NULL,
    content             TEXT        NOT NULL,
    read_time_minutes   INT         NOT NULL DEFAULT 10,
    rating              DECIMAL(3,1) NOT NULL DEFAULT 5.0,
    rating_count        INT         NOT NULL DEFAULT 0,
    is_published        BOOLEAN     NOT NULL DEFAULT TRUE,
    published_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── Notes ────────────────────────────────────────────────────────────────────
CREATE TABLE notes (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(200) NOT NULL,
    track_id            VARCHAR(50)  REFERENCES tracks(id),
    content             TEXT        NOT NULL,
    formula             TEXT,
    background_color    VARCHAR(20) NOT NULL DEFAULT '#fef9c3',
    border_color        VARCHAR(20) NOT NULL DEFAULT '#fde68a',
    text_color          VARCHAR(20) NOT NULL DEFAULT '#78350f',
    label_color         VARCHAR(20) NOT NULL DEFAULT '#92400e',
    is_pinned           BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE projects (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT        NOT NULL,
    difficulty          VARCHAR(20) NOT NULL,
    technologies        TEXT[]      NOT NULL,
    estimated_hours     INT         NOT NULL DEFAULT 4,
    thumbnail           VARCHAR(10),
    github_url          TEXT,
    demo_url            TEXT,
    is_published        BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE project_steps (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_order      INT         NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT        NOT NULL,
    code_snippet    TEXT,
    language        VARCHAR(30)
);

-- ─── Chat Sessions ────────────────────────────────────────────────────────────
CREATE TABLE chat_sessions (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Full-text search index on lessons
CREATE INDEX idx_lessons_fts ON lessons USING gin(
    to_tsvector('english', title || ' ' || COALESCE(content_markdown, ''))
);

-- Full-text search on case studies
CREATE INDEX idx_case_studies_fts ON case_studies USING gin(
    to_tsvector('english', title || ' ' || description)
);
