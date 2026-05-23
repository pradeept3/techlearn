-- V2__seed_data.sql
-- Seed tracks, sample lessons, case studies, notes, and projects

-- ─── Tracks ───────────────────────────────────────────────────────────────────
INSERT INTO tracks (id, name, description, icon, color, bg_color, level, tag, estimated_hours) VALUES
('python',        'Python',                 'From basics to advanced OOP, decorators, async & data pipelines.', '🐍', '#ffd43b', 'rgba(255,212,59,.12)',  'Beginner',     'Core',           20),
('sql',           'SQL & Databases',        'SQL queries, joins, indexes, NoSQL, PostgreSQL, MongoDB.',         '🗄️', '#4ade80', 'rgba(74,222,128,.12)', 'Beginner',     'Core',           15),
('ml',            'Machine Learning',       'Supervised, unsupervised learning, neural nets, model evaluation.','🧠', '#a78bfa', 'rgba(167,139,250,.12)','Intermediate', 'AI/ML',          40),
('java',          'Java & Spring Boot',     'Core Java, OOP, REST APIs with Spring Boot, microservices.',      '☕', '#f97316', 'rgba(249,115,22,.12)',  'Intermediate', 'Backend',        35),
('cloud',         'Cloud & DevOps',         'AWS, GCP, Docker, Kubernetes, CI/CD pipelines.',                  '☁️', '#38bdf8', 'rgba(56,189,248,.12)', 'Intermediate', 'Infrastructure', 30),
('nlp',           'NLP & AI',               'Text processing, sentiment analysis, named entity recognition.',  '💬', '#f472b6', 'rgba(244,114,182,.12)','Advanced',     'AI/ML',          35),
('llm',           'Large Language Models',  'GPT architecture, fine-tuning, RAG, LangChain, prompt engineering.','✨','#22d3ee','rgba(34,211,238,.12)',  'Advanced',     'AI/ML',          30),
('data-analysis', 'Data Analysis',          'Pandas, NumPy, Matplotlib, Seaborn, statistical analysis.',       '📊', '#fb923c', 'rgba(251,146,60,.12)',  'Beginner',     'Data',           25)
ON CONFLICT (id) DO NOTHING;

-- ─── Python Lessons ───────────────────────────────────────────────────────────
INSERT INTO lessons (track_id, title, slug, lesson_order, type, duration_minutes, summary, xp_reward) VALUES
('python', 'Introduction to Python & Setup',         'intro-setup',           1, 'text',    10, 'Set up your Python environment and write your first script.', 30),
('python', 'Variables, Data Types & Operators',      'variables-datatypes',   2, 'text',    15, 'Learn Python''s dynamic typing and core data types.',          40),
('python', 'Control Flow & Loops',                   'control-flow',          3, 'text',    20, 'Master if/elif/else, for loops, while loops, and comprehensions.', 40),
('python', 'Functions & Lambda Expressions',         'functions-lambda',      4, 'text',    25, 'Write reusable functions with args, kwargs, and lambdas.',    50),
('python', 'Lists, Tuples & Dictionaries',           'lists-tuples-dicts',   5, 'text',    20, 'Work with Python''s core collection types.',                  40),
('python', 'File I/O & Exception Handling',          'file-io-exceptions',   6, 'text',    25, 'Read/write files and handle errors gracefully.',              50),
('python', 'Object-Oriented Programming',            'oop',                   7, 'video',   35, 'Classes, inheritance, encapsulation, and polymorphism.',       60),
('python', 'Decorators & Generators',                'decorators-generators', 8, 'text',    30, 'Extend functions with decorators and create lazy sequences.',  60),
('python', 'Async Programming with asyncio',         'async-programming',     9, 'text',    30, 'Write concurrent code with async/await and asyncio.',          60),
('python', 'Data Pipelines with Python',             'data-pipelines',       10, 'project', 45, 'Build an end-to-end data processing pipeline.',               100)
ON CONFLICT (track_id, lesson_order) DO NOTHING;

-- ─── ML Lessons ───────────────────────────────────────────────────────────────
INSERT INTO lessons (track_id, title, slug, lesson_order, type, duration_minutes, summary, xp_reward) VALUES
('ml', 'What is Machine Learning?',          'what-is-ml',           1, 'text',    15, 'Types of ML: supervised, unsupervised, reinforcement.',       30),
('ml', 'Setting Up the ML Environment',      'ml-environment',        2, 'text',    20, 'Install scikit-learn, NumPy, Pandas, and Jupyter.',           30),
('ml', 'Linear Regression Deep Dive',        'linear-regression',     3, 'text',    35, 'Implement linear regression from scratch and with sklearn.',   60),
('ml', 'Gradient Descent & Backprop',        'gradient-descent',      4, 'text',    40, 'Understand the optimization algorithm behind all ML models.', 70),
('ml', 'Logistic Regression & Classification','logistic-regression',  5, 'text',    30, 'Binary and multi-class classification problems.',             60),
('ml', 'Decision Trees & Random Forests',    'decision-trees',        6, 'text',    35, 'Tree-based ensemble models for classification and regression.',60),
('ml', 'Support Vector Machines',            'svm',                   7, 'text',    30, 'Maximum margin classifiers with kernel trick.',               60),
('ml', 'Neural Network Basics',              'neural-networks',       8, 'video',   45, 'Perceptrons, activation functions, forward pass.',            70),
('ml', 'Model Evaluation & Cross-Validation','model-evaluation',      9, 'text',    30, 'Train/test split, k-fold CV, precision, recall, F1.',         60),
('ml', 'Overfitting, Regularization',        'regularization',       10, 'text',    30, 'L1/L2 regularization, dropout, early stopping.',              60)
ON CONFLICT (track_id, lesson_order) DO NOTHING;

-- ─── Case Studies ─────────────────────────────────────────────────────────────
INSERT INTO case_studies (title, company, track_id, tag, description, content, read_time_minutes, rating, rating_count) VALUES
(
  'How Netflix Recommends Your Next Show',
  'Netflix', 'ml', 'Machine Learning',
  'A deep dive into collaborative filtering, matrix factorization, and the $1M Netflix Prize algorithm.',
  '## The Problem\n\nNetflix needed to recommend relevant content to 200M+ subscribers...\n\n## The Solution\n\nCollaborative filtering with matrix factorization...',
  12, 4.9, 312
),
(
  'GPT Architecture: Attention is All You Need',
  'OpenAI', 'llm', 'LLMs & NLP',
  'From the original 2017 transformer paper to GPT-4 — how attention mechanisms revolutionized NLP.',
  '## The Transformer\n\nIn 2017, Vaswani et al. introduced the transformer architecture...\n\n## Self-Attention\n\nAttention(Q,K,V) = softmax(QKᵀ/√d)V...',
  18, 5.0, 284
),
(
  'How Uber Scaled to 1 Billion Trips',
  'Uber', 'cloud', 'Cloud & Scale',
  'The microservices migration, real-time geospatial data, and dynamic pricing algorithms.',
  '## The Monolith Problem\n\nUber started as a monolith in 2009...\n\n## Microservices Migration\n\nThey split into 2000+ microservices...',
  15, 4.8, 198
),
(
  'Instagram Database at 1 Billion Users',
  'Instagram', 'sql', 'SQL & Data',
  'How Instagram chose PostgreSQL, sharded databases, and handled photo metadata at petabyte scale.',
  '## Database Choice\n\nInstagram chose PostgreSQL over MongoDB...\n\n## Sharding Strategy\n\nThey implemented horizontal sharding...',
  14, 4.9, 241
),
(
  'Spring Boot at LinkedIn: Real Microservices',
  'LinkedIn', 'java', 'Java & Backend',
  'Breaking a monolith into services, API gateway patterns, and service mesh at LinkedIn scale.',
  '## The Problem\n\nLinkedIn''s monolith became impossible to deploy...\n\n## Service Decomposition\n\nThey identified bounded contexts...',
  16, 4.8, 176
),
(
  'COVID-19 Data: How Analysts Shaped Policy',
  'WHO/CDC', 'data-analysis', 'Data Analysis',
  'Epidemiological modeling, R-values, statistical pitfalls, and how data visualization influenced public health.',
  '## Data Collection\n\nOver 150 countries reported COVID data...\n\n## Modeling Approaches\n\nSIR models, SEIR extensions...',
  20, 4.7, 289
)
ON CONFLICT DO NOTHING;

-- ─── Handwritten Notes ────────────────────────────────────────────────────────
INSERT INTO notes (title, track_id, content, background_color, border_color, text_color, label_color, is_pinned) VALUES
('Big-O Notation Cheatsheet', 'ml',
 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)
Bubble sort = O(n²) | Merge sort = O(n log n) | Binary search = O(log n)
Always aim for O(n log n) or better for large datasets!',
 '#fef9c3', '#fde68a', '#78350f', '#92400e', true),

('SQL JOIN Types', 'sql',
 'INNER JOIN → only matching rows in both tables
LEFT JOIN → all from left + matches from right (NULL if no match)
RIGHT JOIN → all from right + matches from left
FULL OUTER JOIN → everything from both tables
CROSS JOIN → cartesian product (use carefully!)',
 '#dcfce7', '#bbf7d0', '#14532d', '#15803d', true),

('Python List Comprehension', 'python',
 '[x*2 for x in range(10)]
[x for x in lst if x > 0]
{k:v for k,v in dict.items()}
{x for x in lst}  # set comprehension
nested: [i for row in matrix for i in row]',
 '#fef3c7', '#fde68a', '#451a03', '#b45309', false),

('ML Model Selection Guide', 'ml',
 'Tabular data → XGBoost / Random Forest
Text → Transformers (BERT, GPT)
Images → CNNs (ResNet, EfficientNet)
Time Series → LSTM / Prophet / N-BEATS
Always start simple → benchmark → iterate up',
 '#ede9fe', '#ddd6fe', '#3b0764', '#6d28d9', true),

('Docker Quick Commands', 'cloud',
 'docker build -t myapp:latest .
docker run -p 8080:80 myapp
docker-compose up -d
docker ps / docker stop [id] / docker logs [id]
docker exec -it [id] bash
docker system prune -a  # cleanup',
 '#dbeafe', '#bfdbfe', '#1e3a5f', '#1d4ed8', false),

('Transformer Architecture Keys', 'llm',
 'Attention(Q,K,V) = softmax(QKᵀ/√d)V
Multi-head = parallel attention heads (capture different patterns)
Positional encoding adds sequence order information
Feed-forward network after each attention layer
Layer norm + residual connections everywhere!',
 '#fce7f3', '#fbcfe8', '#500724', '#be185d', true),

('Pandas Cheatsheet', 'data-analysis',
 'df.head() / df.tail() → preview data
df.info() → column types and null counts
df.describe() → statistical summary
df.groupby(col).agg(func) → aggregation
df.merge(df2, on=col, how=join_type)
df[df[col] > val]  → filtering rows',
 '#ffedd5', '#fed7aa', '#431407', '#c2410c', false),

('Spring Boot Annotations', 'java',
 '@RestController → HTTP controller (combines @Controller + @ResponseBody)
@RequestMapping / @GetMapping / @PostMapping
@Service → business logic layer
@Repository → data access layer
@Autowired → dependency injection
@Transactional → database transactions',
 '#f0fdf4', '#bbf7d0', '#052e16', '#15803d', false)
ON CONFLICT DO NOTHING;

-- ─── Projects ─────────────────────────────────────────────────────────────────
INSERT INTO projects (name, description, difficulty, technologies, estimated_hours, thumbnail) VALUES
('Stock Price Predictor',
 'Build an ML model that predicts stock prices using LSTM neural networks, technical indicators, and historical data from Yahoo Finance.',
 'Intermediate', ARRAY['Python','TensorFlow','Pandas','scikit-learn'], 8, '📈'),

('REST API with Spring Boot',
 'Design and build a production-ready REST API with CRUD operations, JWT authentication, PostgreSQL, and Swagger documentation.',
 'Intermediate', ARRAY['Java','Spring Boot','PostgreSQL','JWT'], 10, '⚙️'),

('Sentiment Analyzer Web App',
 'Build a real-time sentiment analysis app using HuggingFace transformers, Flask backend, and a React frontend with live charts.',
 'Beginner', ARRAY['Python','NLP','Flask','React'], 6, '💬'),

('RAG-powered Study Chatbot',
 'Create a chatbot that answers questions about your uploaded notes using RAG, LangChain, ChromaDB, and the Anthropic/OpenAI API.',
 'Advanced', ARRAY['LLM','LangChain','Python','FastAPI'], 12, '🤖'),

('Real-time Analytics Dashboard',
 'Build a live data dashboard with PostgreSQL, Spring Boot SSE/WebSocket, and a React frontend with Recharts visualizations.',
 'Intermediate', ARRAY['SQL','Spring Boot','React','Docker'], 10, '📊'),

('Image Classifier with CNN',
 'Train a convolutional neural network from scratch to classify images, then deploy it as a REST API on AWS Lambda.',
 'Advanced', ARRAY['Python','TensorFlow','CNN','AWS'], 14, '🖼️'),

('CI/CD Pipeline with GitHub Actions',
 'Build a complete DevOps pipeline: Docker containerize an app, test it, push to ECR, and deploy to ECS with zero-downtime.',
 'Intermediate', ARRAY['Docker','AWS','GitHub Actions','Bash'], 8, '🔄'),

('Full-Stack Todo App',
 'Classic full-stack project: React frontend, Spring Boot backend, PostgreSQL, JWT auth, Docker Compose. Great for interviews.',
 'Beginner', ARRAY['React','Java','PostgreSQL','Docker'], 6, '✅')
ON CONFLICT DO NOTHING;
