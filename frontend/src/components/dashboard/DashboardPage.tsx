import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Rocket, Terminal, Flame, BookOpen, Code2, BarChart3, Package } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { coursesApi } from '@/api/client'
import type { Track } from '@/types'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { data: tracksData } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => coursesApi.getTracks(),
  })

  const tracks: Track[] = tracksData?.data?.data || STATIC_TRACKS

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative bg-bg-tertiary border border-border rounded-2xl p-8 mb-7 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
          style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
        <div className="absolute bottom-0 left-48 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-accent mb-4"
          style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
          ✨ AI-Powered Learning Platform
        </div>

        <h1 className="font-display text-4xl font-bold text-white mb-3 leading-tight">
          Welcome back, <span className="gradient-text italic">{user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className="text-gray-400 text-base max-w-xl leading-relaxed mb-6">
          Pick up where you left off, explore a new track, or ask Aria to explain anything.
          Your AI tutor is always ready.
        </p>

        {user?.role === 'admin' && (
          <div className="mb-6 rounded-3xl border border-accent/20 bg-surface-2 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-accent">Admin Console</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Admin controls are available</h2>
                <p className="mt-2 text-gray-400">Create and manage tracks, lessons, videos, and technologies from the admin dashboard.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-2"
              >
                Open Admin Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/tracks')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}
          >
            <Rocket size={16} /> Continue Learning
          </button>
          <button
            onClick={() => navigate('/playground')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-surface border border-border hover:bg-surface-2 transition-all"
          >
            <Terminal size={16} /> Open Playground
          </button>
        </div>

        {/* Hero stats */}
        <div className="flex gap-8 mt-8 pt-6 border-t border-border">
          {[
            { val: user?.xp?.toLocaleString() ?? '0', label: 'XP Earned' },
            { val: '24', label: 'Lessons Done' },
            { val: `🔥 ${user?.streak ?? 0}`, label: 'Day Streak' },
            { val: '3', label: 'Projects Built' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { icon: BookOpen, color: 'text-accent', bg: 'rgba(79,142,247,.1)', val: '320+', label: 'Lessons' },
          { icon: Code2, color: 'text-green-400', bg: 'rgba(16,185,129,.1)', val: '150+', label: 'Code Examples' },
          { icon: BarChart3, color: 'text-purple-400', bg: 'rgba(163,139,250,.1)', val: '40+', label: 'Graphs & Viz' },
          { icon: Package, color: 'text-amber-400', bg: 'rgba(245,158,11,.1)', val: '24', label: 'Mini Projects' },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Flame size={18} className="text-orange-400" /> Continue Where You Left Off
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {CONTINUE_TRACKS.map((t) => (
            <div key={t.id}
              onClick={() => navigate(`/tracks/${t.id}`)}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-2 hover:border-border-2 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: t.bg }}>
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white mb-1">{t.name}</div>
                <div className="text-xs text-gray-500 mb-2">{t.subtitle}</div>
                <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.progress}%`, background: t.color }} />
                </div>
              </div>
              <div className="text-gray-500 group-hover:text-white transition-colors flex-shrink-0">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* All tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">All Learning Tracks</h2>
          <button onClick={() => navigate('/tracks')} className="text-sm text-accent hover:text-white transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {tracks.slice(0, 8).map((track) => (
            <TrackCard key={track.id} track={track} onClick={() => navigate(`/tracks/${track.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TrackCard({ track, onClick }: { track: Track; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:bg-surface-2 hover:border-border-2 hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
        style={{ background: track.bgColor }}>
        {track.icon}
      </div>
      <div className="text-sm font-semibold text-white mb-1.5">{track.name}</div>
      <div className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{track.description}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <BookOpen size={11} /> {track.totalLessons} lessons
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: track.bgColor, color: track.color }}>
          {track.level}
        </span>
      </div>
    </div>
  )
}

const CONTINUE_TRACKS = [
  { id: 'python', name: 'Python — Functions & OOP', subtitle: 'Lesson 7 of 28 · 45 min left', emoji: '🐍', bg: 'rgba(255,212,59,.12)', color: '#ffd43b', progress: 25 },
  { id: 'ml', name: 'Machine Learning — Linear Regression', subtitle: 'Lesson 3 of 42 · 1.5 hrs left', emoji: '🧠', bg: 'rgba(167,139,250,.12)', color: '#a78bfa', progress: 7 },
]

const STATIC_TRACKS: Track[] = [
  { id: 'python', name: 'Python', description: 'From basics to advanced OOP, decorators, async & data pipelines.', icon: '🐍', color: '#ffd43b', bgColor: 'rgba(255,212,59,.12)', totalLessons: 28, level: 'Beginner', tag: 'Core', estimatedHours: 20 },
  { id: 'sql', name: 'SQL & Databases', description: 'SQL queries, joins, indexes, NoSQL, PostgreSQL, MongoDB.', icon: '🗄️', color: '#4ade80', bgColor: 'rgba(74,222,128,.12)', totalLessons: 22, level: 'Beginner', tag: 'Core', estimatedHours: 15 },
  { id: 'ml', name: 'Machine Learning', description: 'Supervised, unsupervised learning, neural nets, model evaluation.', icon: '🧠', color: '#a78bfa', bgColor: 'rgba(167,139,250,.12)', totalLessons: 42, level: 'Intermediate', tag: 'AI/ML', estimatedHours: 40 },
  { id: 'java', name: 'Java & Spring Boot', description: 'Core Java, OOP, REST APIs with Spring Boot, microservices.', icon: '☕', color: '#f97316', bgColor: 'rgba(249,115,22,.12)', totalLessons: 35, level: 'Intermediate', tag: 'Backend', estimatedHours: 35 },
  { id: 'cloud', name: 'Cloud & DevOps', description: 'AWS, GCP, Docker, Kubernetes, CI/CD pipelines.', icon: '☁️', color: '#38bdf8', bgColor: 'rgba(56,189,248,.12)', totalLessons: 30, level: 'Intermediate', tag: 'Infrastructure', estimatedHours: 30 },
  { id: 'nlp', name: 'NLP & AI', description: 'Text processing, sentiment analysis, named entity recognition.', icon: '💬', color: '#f472b6', bgColor: 'rgba(244,114,182,.12)', totalLessons: 32, level: 'Advanced', tag: 'AI/ML', estimatedHours: 35 },
  { id: 'llm', name: 'Large Language Models', description: 'GPT architecture, fine-tuning, RAG, LangChain, prompt engineering.', icon: '✨', color: '#22d3ee', bgColor: 'rgba(34,211,238,.12)', totalLessons: 25, level: 'Advanced', tag: 'AI/ML', estimatedHours: 30 },
  { id: 'data-analysis', name: 'Data Analysis', description: 'Pandas, NumPy, Matplotlib, Seaborn, statistical analysis.', icon: '📊', color: '#fb923c', bgColor: 'rgba(251,146,60,.12)', totalLessons: 26, level: 'Beginner', tag: 'Data', estimatedHours: 25 },
]
