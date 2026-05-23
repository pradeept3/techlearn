import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Circle, PlayCircle, Lock, Clock, ChevronRight, BookOpen } from 'lucide-react'
import { coursesApi } from '@/api/client'
import { CodeEditor } from '@/components/ui/CodeEditor'
import type { LessonSummaryDto } from '@/types'

const TRACK_META: Record<string, {
  icon: string; color: string; bg: string
  graph: { title: string; bars: { label: string; value: number; color: string }[] }
  code: { title: string; language: string; code: string; output: string }
  note: { title: string; content: string; bg: string; border: string; text: string; label: string }
}> = {
  python: {
    icon: '🐍', color: '#ffd43b', bg: 'rgba(255,212,59,.12)',
    graph: {
      title: 'Python Popularity Index 2024',
      bars: [
        { label: 'Python', value: 100, color: '#ffd43b' },
        { label: 'JavaScript', value: 85, color: '#4ade80' },
        { label: 'Java', value: 72, color: '#f97316' },
        { label: 'C++', value: 58, color: '#60a5fa' },
        { label: 'Rust', value: 32, color: '#f472b6' },
      ],
    },
    code: { title: 'Python OOP Example', language: 'python',
      code: `class DataScientist:\n    def __init__(self, name, skills):\n        self.name = name\n        self.skills = skills\n\n    def analyze(self, data):\n        return {\n            'mean': sum(data) / len(data),\n            'max': max(data),\n            'min': min(data)\n        }\n\nds = DataScientist("Alice", ["Python", "ML"])\nprint(ds.analyze([85, 92, 78, 96, 88]))`,
      output: "{'mean': 87.8, 'max': 96, 'min': 78}" },
    note: { title: 'Python Key Concepts', bg: '#fef9c3', border: '#fde68a', text: '#78350f', label: '#92400e',
      content: `• Everything is an object in Python\n• Indentation = code blocks (4 spaces)\n• GIL prevents true parallelism → use multiprocessing\n• List comprehensions are faster than loops\n• Use virtual environments for every project` },
  },
  ml: {
    icon: '🧠', color: '#a78bfa', bg: 'rgba(167,139,250,.12)',
    graph: {
      title: 'Model Accuracy vs Complexity',
      bars: [
        { label: 'Linear Reg.', value: 52, color: '#4ade80' },
        { label: 'Decision Tree', value: 71, color: '#60a5fa' },
        { label: 'Random Forest', value: 86, color: '#a78bfa' },
        { label: 'XGBoost', value: 92, color: '#f97316' },
        { label: 'Neural Net', value: 96, color: '#22d3ee' },
      ],
    },
    code: { title: 'Linear Regression from Scratch', language: 'python',
      code: `import numpy as np\n\nclass LinearRegression:\n    def fit(self, X, y, lr=0.01, epochs=1000):\n        self.w = np.zeros(X.shape[1])\n        self.b = 0\n        for _ in range(epochs):\n            y_pred = X @ self.w + self.b\n            dw = (2/len(X)) * X.T @ (y_pred - y)\n            db = (2/len(X)) * np.sum(y_pred - y)\n            self.w -= lr * dw\n            self.b -= lr * db\n\n    def predict(self, X):\n        return X @ self.w + self.b`,
      output: 'Training... epoch 1000/1000\nFinal MSE: 0.0023 | R² Score: 0.9941\nWeights: [2.47, -0.83]' },
    note: { title: 'ML Algorithm Selection', bg: '#ede9fe', border: '#ddd6fe', text: '#3b0764', label: '#6d28d9',
      content: `• Tabular data → XGBoost / Random Forest\n• Text → Transformers (BERT, GPT)\n• Images → CNNs (ResNet, EfficientNet)\n• Time Series → LSTM / Prophet\n• Always start simple → benchmark → iterate` },
  },
  sql: {
    icon: '🗄️', color: '#4ade80', bg: 'rgba(74,222,128,.12)',
    graph: {
      title: 'Query Time: Index vs No Index (ms)',
      bars: [
        { label: 'No Index', value: 100, color: '#ef4444' },
        { label: 'B-Tree Index', value: 12, color: '#f97316' },
        { label: 'Hash Index', value: 8, color: '#ffd43b' },
        { label: 'Clustered', value: 4, color: '#4ade80' },
        { label: 'Covering', value: 2, color: '#22d3ee' },
      ],
    },
    code: { title: 'SQL Window Functions', language: 'sql',
      code: `-- Rank customers by spending per region\nSELECT\n    customer_name,\n    region,\n    total_spent,\n    RANK() OVER (\n        PARTITION BY region\n        ORDER BY total_spent DESC\n    ) AS spending_rank,\n    SUM(total_spent) OVER (PARTITION BY region) AS region_total\nFROM customers;`,
      output: 'customer_name | region | total_spent | rank | region_total\nAlice Johnson  | West   | 4230        | 1    | 18450\nBob Chen       | West   | 3890        | 2    | 18450' },
    note: { title: 'SQL Optimization Tips', bg: '#dcfce7', border: '#bbf7d0', text: '#14532d', label: '#15803d',
      content: `• Index WHERE and JOIN columns\n• Avoid SELECT * in production\n• Use EXPLAIN to analyze query plans\n• CTEs improve readability\n• Partitioning helps for >10M rows` },
  },
  java: {
    icon: '☕', color: '#f97316', bg: 'rgba(249,115,22,.12)',
    graph: {
      title: 'Framework Popularity (GitHub Stars K)',
      bars: [
        { label: 'Spring Boot', value: 88, color: '#f97316' },
        { label: 'Django', value: 76, color: '#4ade80' },
        { label: 'Express.js', value: 82, color: '#ffd43b' },
        { label: 'FastAPI', value: 71, color: '#60a5fa' },
        { label: 'Rails', value: 58, color: '#f472b6' },
      ],
    },
    code: { title: 'Spring Boot REST Controller', language: 'java',
      code: `@RestController\n@RequestMapping("/api/products")\npublic class ProductController {\n\n    @Autowired\n    private ProductService productService;\n\n    @GetMapping\n    public ResponseEntity<List<Product>> getAll() {\n        return ResponseEntity.ok(productService.findAll());\n    }\n\n    @PostMapping\n    public ResponseEntity<Product> create(@RequestBody ProductDTO dto) {\n        return ResponseEntity.status(201)\n            .body(productService.create(dto));\n    }\n}`,
      output: 'GET /api/products → 200 OK [47ms]\n[{"id":1,"name":"Laptop","price":999.99}, ...]\n\nPOST /api/products → 201 Created' },
    note: { title: 'Spring Boot Architecture', bg: '#ffedd5', border: '#fed7aa', text: '#431407', label: '#c2410c',
      content: `• Controller → Service → Repository → DB\n• @RestController handles HTTP requests\n• @Service contains business logic\n• @Repository handles DB operations\n• DI via @Autowired / constructor injection` },
  },
  cloud: {
    icon: '☁️', color: '#38bdf8', bg: 'rgba(56,189,248,.12)',
    graph: {
      title: 'Cloud Market Share 2024 (%)',
      bars: [
        { label: 'AWS', value: 100, color: '#f97316' },
        { label: 'Azure', value: 72, color: '#60a5fa' },
        { label: 'GCP', value: 48, color: '#4ade80' },
        { label: 'Alibaba', value: 22, color: '#ffd43b' },
        { label: 'Others', value: 15, color: '#94a3b8' },
      ],
    },
    code: { title: 'Multi-Stage Dockerfile', language: 'bash',
      code: `# Multi-stage build for production\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\nFROM node:18-alpine AS runtime\nWORKDIR /app\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]`,
      output: 'Building stage 1/2 (builder)... ✓\nBuilding stage 2/2 (runtime)... ✓\nImage size: 87MB (vs 850MB single-stage)\nSecurity: 0 critical vulnerabilities ✓' },
    note: { title: 'AWS Core Services', bg: '#dbeafe', border: '#bfdbfe', text: '#1e3a5f', label: '#1d4ed8',
      content: `• EC2 → Virtual servers\n• S3 → Object storage\n• RDS → Managed relational DB\n• Lambda → Serverless functions\n• CloudFront → Global CDN\n• IAM → Identity & Access` },
  },
  llm: {
    icon: '✨', color: '#22d3ee', bg: 'rgba(34,211,238,.12)',
    graph: {
      title: 'LLM Context Window (K tokens)',
      bars: [
        { label: 'GPT-3.5', value: 16, color: '#4ade80' },
        { label: 'GPT-4', value: 32, color: '#60a5fa' },
        { label: 'Claude 3', value: 100, color: '#a78bfa' },
        { label: 'Gemini 1.5', value: 100, color: '#f97316' },
        { label: 'Claude 3.7', value: 100, color: '#22d3ee' },
      ],
    },
    code: { title: 'RAG Pipeline with LangChain', language: 'python',
      code: `from langchain_openai import ChatOpenAI, OpenAIEmbeddings\nfrom langchain_community.vectorstores import Chroma\nfrom langchain.chains import RetrievalQA\n\n# Build RAG pipeline\nembeddings = OpenAIEmbeddings()\nvectordb = Chroma.from_documents(\n    documents=docs,\n    embedding=embeddings,\n    persist_directory="./chroma_db"\n)\n\nqa_chain = RetrievalQA.from_chain_type(\n    llm=ChatOpenAI(model="gpt-4o-mini"),\n    retriever=vectordb.as_retriever(k=4),\n    return_source_documents=True\n)\n\nresult = qa_chain.invoke("What is attention?")`,
      output: 'Retrieving 4 relevant chunks...\nAnswer: "Attention allows the model to weigh the\nimportance of different tokens..."\nSources: transformer_paper.pdf p.3-5' },
    note: { title: 'LLM Key Concepts', bg: '#fce7f3', border: '#fbcfe8', text: '#500724', label: '#be185d',
      content: `• Temperature → randomness (0=deterministic)\n• Top-p/Top-k → token diversity\n• Context window → max tokens at once\n• RAG → ground LLM in your data\n• Fine-tuning → adapt for your task\n• Hallucination → always verify outputs!` },
  },
  nlp: {
    icon: '💬', color: '#f472b6', bg: 'rgba(244,114,182,.12)',
    graph: {
      title: 'NLP Task Accuracy: BERT vs Human (%)',
      bars: [
        { label: 'Sentiment (BERT)', value: 94, color: '#f472b6' },
        { label: 'Sentiment (Human)', value: 96, color: '#94a3b8' },
        { label: 'NER (BERT)', value: 91, color: '#f472b6' },
        { label: 'NER (Human)', value: 97, color: '#94a3b8' },
        { label: 'QA (BERT)', value: 88, color: '#f472b6' },
      ],
    },
    code: { title: 'Sentiment Analysis with HuggingFace', language: 'python',
      code: `from transformers import pipeline\n\nclassifier = pipeline(\n    "sentiment-analysis",\n    model="distilbert-base-uncased-finetuned-sst-2-english"\n)\n\nreviews = [\n    "This course is absolutely amazing!",\n    "Very boring content, not recommended",\n    "Good intro but needs more depth"\n]\n\nfor text, res in zip(reviews, classifier(reviews)):\n    print(f"{text[:35]}... → {res['label']} ({res['score']:.2f})")`,
      output: "This course is absolutely amazin... → POSITIVE (0.99)\nVery boring content, not recomme... → NEGATIVE (0.98)\nGood intro but needs more depth... → POSITIVE (0.73)" },
    note: { title: 'NLP Pipeline Steps', bg: '#fdf4ff', border: '#f0abfc', text: '#3b0764', label: '#7e22ce',
      content: `1. Raw Text → Tokenize → Normalize\n2. Remove stopwords & punctuation\n3. Stemming / Lemmatization\n4. Feature extraction (TF-IDF / Embeddings)\n5. Model (classify / extract / generate)\n6. Post-process & evaluate` },
  },
  'data-analysis': {
    icon: '📊', color: '#fb923c', bg: 'rgba(251,146,60,.12)',
    graph: {
      title: 'Data Science Tool Usage 2024 (%)',
      bars: [
        { label: 'Pandas', value: 96, color: '#fb923c' },
        { label: 'NumPy', value: 88, color: '#60a5fa' },
        { label: 'Matplotlib', value: 78, color: '#4ade80' },
        { label: 'Scikit-learn', value: 72, color: '#a78bfa' },
        { label: 'TensorFlow', value: 54, color: '#f472b6' },
      ],
    },
    code: { title: 'EDA Pipeline with Pandas', language: 'python',
      code: `import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('sales_data.csv')\n\n# Quick EDA\nprint(df.describe())\nprint(f"Nulls: {df.isnull().sum().sum()}")\n\n# Monthly revenue trend\nmonthly = df.groupby('month')['revenue'].sum()\nmonthly.plot(\n    kind='bar',\n    figsize=(10, 5),\n    title='Monthly Revenue 2024',\n    color='#4f8ef7'\n)\nplt.tight_layout()\nplt.savefig('revenue.png', dpi=150)`,
      output: '       revenue    quantity\ncount  12000.00   12000.00\nmean    4230.45      14.23\nstd     1820.32       8.91\nNulls: 23 → cleaned\nPlot saved: revenue.png ✓' },
    note: { title: 'Pandas Cheatsheet', bg: '#fff7ed', border: '#fed7aa', text: '#431407', label: '#c2410c',
      content: `• df.head() / df.tail() → preview data\n• df.info() → dtypes & null counts\n• df.describe() → stats summary\n• df.groupby().agg() → aggregation\n• df.merge() → SQL-style joins\n• df[df[col] > val] → filtering` },
  },
}

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const navigate = useNavigate()

  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ['lessons', trackId],
    queryFn: () => coursesApi.getLessons(trackId!),
    enabled: !!trackId,
  })

  const meta = TRACK_META[trackId!] || TRACK_META['python']
  const lessons: LessonSummaryDto[] = lessonsData?.data?.data || DEMO_LESSONS

  const completed = lessons.filter((l) => l.completed).length
  const progressPercent = Math.round((completed / lessons.length) * 100)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Track header */}
      <div className="flex items-center gap-5 mb-7">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: meta.bg }}>
          {meta.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {TRACK_META[trackId!] ? trackId!.charAt(0).toUpperCase() + trackId!.slice(1).replace('-', ' ') : 'Track'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>
              {lessons.length} lessons
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><BookOpen size={13} /> {completed} / {lessons.length} completed</span>
            <span className="flex items-center gap-1"><Clock size={13} /> ~{Math.ceil(lessons.length * 0.5)}h total</span>
          </div>
          <div className="mt-2 h-1.5 bg-surface rounded-full w-64 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%`, background: meta.color }} />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* LEFT: Lesson list */}
        <div>
          <div className="text-sm font-semibold text-white mb-3">Lessons</div>
          <div className="space-y-1">
            {isLoading
              ? Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
                ))
              : lessons.map((lesson, i) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={i}
                    onClick={() => navigate(`/tracks/${trackId}/lessons/${lesson.id}`)}
                  />
                ))}
          </div>
        </div>

        {/* RIGHT: Graph + Code + Note */}
        <div className="space-y-5">
          {/* Graph */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="text-sm font-semibold text-white mb-1">{meta.graph.title}</div>
            <div className="space-y-2.5 mt-4">
              {meta.graph.bars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-28 text-right flex-shrink-0">{bar.label}</div>
                  <div className="flex-1 h-5 bg-bg-primary rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${bar.value}%`, background: bar.color }}>
                      <span className="text-xs font-bold text-white">{bar.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <CodeEditor
            title={meta.code.title}
            language={meta.code.language}
            initialCode={meta.code.code}
            expectedOutput={meta.code.output}
          />

          {/* Handwritten note */}
          <div className="note-card" style={{
            background: `linear-gradient(135deg, ${meta.note.bg}, ${meta.note.bg})`,
            border: `1px solid ${meta.note.border}`,
          }}>
            <div className="note-tape" style={{ background: meta.note.border }} />
            <div className="text-sm font-semibold mb-2 flex items-center gap-1.5"
              style={{ color: meta.note.label }}>
              ✏️ {meta.note.title}
            </div>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans"
              style={{ color: meta.note.text }}>
              {meta.note.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function LessonRow({ lesson, index, onClick }: { lesson: LessonSummaryDto; index: number; onClick: () => void }) {
  const TYPE_COLORS: Record<string, string> = {
    text: 'bg-blue-500/10 text-blue-400',
    video: 'bg-purple-500/10 text-purple-400',
    quiz: 'bg-amber-500/10 text-amber-400',
    project: 'bg-green-500/10 text-green-400',
  }

  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-surface transition-all group">
      <div className="flex-shrink-0">
        {lesson.completed
          ? <CheckCircle size={20} className="text-green-400" />
          : index === 3
            ? <PlayCircle size={20} className="text-accent" />
            : <Circle size={20} className="text-gray-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{lesson.title}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
          <Clock size={11} /> {lesson.durationMinutes}m
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[lesson.type] || ''}`}>
            {lesson.type}
          </span>
        </div>
      </div>
      <ChevronRight size={15} className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
    </div>
  )
}

const DEMO_LESSONS: LessonSummaryDto[] = [
  { id: 'l1', trackId: 'python', title: 'Introduction & Setup', slug: 'intro', order: 1, type: 'text', durationMinutes: 10, completed: true },
  { id: 'l2', trackId: 'python', title: 'Variables & Data Types', slug: 'variables', order: 2, type: 'text', durationMinutes: 15, completed: true },
  { id: 'l3', trackId: 'python', title: 'Control Flow & Loops', slug: 'control-flow', order: 3, type: 'text', durationMinutes: 20, completed: true },
  { id: 'l4', trackId: 'python', title: 'Functions & Lambda', slug: 'functions', order: 4, type: 'video', durationMinutes: 25, completed: false },
  { id: 'l5', trackId: 'python', title: 'Lists, Tuples & Dicts', slug: 'collections', order: 5, type: 'text', durationMinutes: 20, completed: false },
  { id: 'l6', trackId: 'python', title: 'File I/O & Exceptions', slug: 'file-io', order: 6, type: 'text', durationMinutes: 25, completed: false },
  { id: 'l7', trackId: 'python', title: 'OOP — Classes & Inheritance', slug: 'oop', order: 7, type: 'video', durationMinutes: 35, completed: false },
  { id: 'l8', trackId: 'python', title: 'Decorators & Generators', slug: 'decorators', order: 8, type: 'text', durationMinutes: 30, completed: false },
  { id: 'l9', trackId: 'python', title: 'Async Programming', slug: 'async', order: 9, type: 'text', durationMinutes: 30, completed: false },
  { id: 'l10', trackId: 'python', title: 'Data Pipeline Project', slug: 'project', order: 10, type: 'project', durationMinutes: 45, completed: false },
]
