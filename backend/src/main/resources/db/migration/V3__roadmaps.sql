-- V3__roadmaps.sql
-- Roadmap, RoadmapNode, UserRoadmapProgress, UserNodeProgress tables

-- ─── Roadmaps ─────────────────────────────────────────────────────────────────
CREATE TABLE roadmaps (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(200) NOT NULL,
    description      VARCHAR(500),
    career_goal      VARCHAR(100),
    estimated_weeks  INT          NOT NULL DEFAULT 8,
    difficulty       VARCHAR(20)  NOT NULL DEFAULT 'BEGINNER',
    thumbnail_emoji  VARCHAR(10)  NOT NULL DEFAULT '🗺️',
    is_published     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Roadmap Nodes ────────────────────────────────────────────────────────────
CREATE TABLE roadmap_nodes (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id    UUID         NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    node_order    INT          NOT NULL,
    title         VARCHAR(200) NOT NULL,
    description   VARCHAR(500),
    type          VARCHAR(20)  NOT NULL,   -- TRACK | LESSON | PROJECT | CASE_STUDY | EXTERNAL | QUIZ
    reference_id  VARCHAR(100),            -- trackId / lessonId / projectId etc.
    external_url  VARCHAR(500),
    xp_reward     INT          NOT NULL DEFAULT 100,
    is_optional   BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (roadmap_id, node_order)
);

CREATE INDEX idx_roadmap_nodes_roadmap ON roadmap_nodes(roadmap_id);

-- ─── Node Prerequisites ───────────────────────────────────────────────────────
CREATE TABLE roadmap_node_prerequisites (
    node_id              UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    prerequisite_node_id UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id, prerequisite_node_id)
);

-- ─── User Roadmap Progress ────────────────────────────────────────────────────
CREATE TABLE user_roadmap_progress (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    roadmap_id        UUID        NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    status            VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    progress_percent  INT         NOT NULL DEFAULT 0,
    xp_earned         INT         NOT NULL DEFAULT 0,
    current_node_id   UUID        REFERENCES roadmap_nodes(id),
    enrolled_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    last_activity_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMP,
    UNIQUE (user_id, roadmap_id)
);

CREATE INDEX idx_urp_user    ON user_roadmap_progress(user_id);
CREATE INDEX idx_urp_roadmap ON user_roadmap_progress(roadmap_id);
CREATE INDEX idx_urp_status  ON user_roadmap_progress(user_id, status);

-- ─── User Node Progress ───────────────────────────────────────────────────────
CREATE TABLE user_node_progress (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_progress_id   UUID        NOT NULL REFERENCES user_roadmap_progress(id) ON DELETE CASCADE,
    roadmap_node_id       UUID        NOT NULL REFERENCES roadmap_nodes(id)         ON DELETE CASCADE,
    status                VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    progress_percent      INT         NOT NULL DEFAULT 0,
    xp_earned             INT         NOT NULL DEFAULT 0,
    attempts              INT         NOT NULL DEFAULT 0,
    best_score            INT,
    user_notes            VARCHAR(2000),
    unlocked_at           TIMESTAMP,
    started_at            TIMESTAMP,
    completed_at          TIMESTAMP,
    last_activity_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (roadmap_progress_id, roadmap_node_id)
);

CREATE INDEX idx_unp_progress ON user_node_progress(roadmap_progress_id);
CREATE INDEX idx_unp_node     ON user_node_progress(roadmap_node_id);
CREATE INDEX idx_unp_status   ON user_node_progress(roadmap_progress_id, status);

-- ─── Seed: Sample Roadmaps ────────────────────────────────────────────────────

INSERT INTO roadmaps (id, title, description, career_goal, estimated_weeks, difficulty, thumbnail_emoji)
VALUES
(
    gen_random_uuid(),
    'Become an ML Engineer',
    'Go from Python beginner to building and deploying production ML models.',
    'ML Engineer',
    20, 'INTERMEDIATE', '🧠'
),
(
    gen_random_uuid(),
    'Full-Stack Java Developer',
    'Master Java, Spring Boot, SQL, and Cloud to build production APIs.',
    'Backend Engineer',
    18, 'INTERMEDIATE', '☕'
),
(
    gen_random_uuid(),
    'Data Analyst Track',
    'Learn Python, SQL, Pandas, and visualization to analyze data professionally.',
    'Data Analyst',
    12, 'BEGINNER', '📊'
),
(
    gen_random_uuid(),
    'LLM & AI Application Builder',
    'Master transformers, RAG, LangChain, and deploy AI-powered apps.',
    'AI Engineer',
    16, 'ADVANCED', '✨'
)
ON CONFLICT DO NOTHING;
