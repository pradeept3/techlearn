// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'student' | 'instructor' | 'admin'
  createdAt: string
  xp: number
  streak: number
  level: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// ─── Courses ─────────────────────────────────────────────────────────────────
export type TrackId =
  | 'python' | 'sql' | 'ml' | 'java' | 'cloud'
  | 'nlp' | 'llm' | 'data-analysis'

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Track {
  id: TrackId
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  totalLessons: number
  level: DifficultyLevel
  tag: string
  estimatedHours: number
}

export interface Lesson {
  id: string
  trackId: TrackId
  title: string
  slug: string
  order: number
  type: 'video' | 'text' | 'quiz' | 'project'
  durationMinutes: number
  content: LessonContent
  codeExamples: CodeExample[]
  quiz?: Quiz
  isPublished: boolean
}

export interface LessonContent {
  markdown: string
  summary: string
  objectives: string[]
}

export interface CodeExample {
  id: string
  title: string
  language: string
  code: string
  expectedOutput?: string
  explanation: string
}

export interface Quiz {
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LessonSummaryDto {
  id: string
  trackId: TrackId
  title: string
  slug: string
  order: number
  type: 'video' | 'text' | 'quiz' | 'project'
  durationMinutes: number
  completed?: boolean
  isPublished?: boolean
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface UserProgress {
  userId: string
  trackId: TrackId
  completedLessons: string[]
  currentLessonId: string | null
  progressPercent: number
  xpEarned: number
  startedAt: string
  lastActivityAt: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  dailyActivity: DailyActivity[]
}

export interface DailyActivity {
  date: string
  minutesLearned: number
  lessonsCompleted: number
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  description: string
  difficulty: DifficultyLevel
  technologies: string[]
  estimatedHours: number
  thumbnail: string
  githubUrl?: string
  demoUrl?: string
  steps: ProjectStep[]
}

export interface ProjectStep {
  order: number
  title: string
  description: string
  codeSnippet?: string
  language?: string
}

// ─── Case Studies ─────────────────────────────────────────────────────────────
export interface CaseStudy {
  id: string
  title: string
  company: string
  trackId: TrackId
  tag: string
  description: string
  content: string
  readTimeMinutes: number
  rating: number
  ratingCount: number
  publishedAt: string
  graphs?: CaseStudyGraph[]
}

export interface CaseStudyGraph {
  title: string
  type: 'bar' | 'line' | 'pie'
  data: { label: string; value: number }[]
}

// ─── Handwritten Notes ────────────────────────────────────────────────────────
export interface Note {
  id: string
  title: string
  trackId: TrackId
  content: string
  formula?: string
  backgroundColor: string
  borderColor: string
  textColor: string
  labelColor: string
  createdAt: string
  isPinned: boolean
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sources?: RAGSource[]
  isStreaming?: boolean
}

export interface RAGSource {
  trackId: string
  lessonTitle: string
  relevanceScore: number
  excerpt: string
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatarUrl?: string
  xp: number
  streak: number
  country?: string
  isCurrentUser: boolean
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  status: number
}
