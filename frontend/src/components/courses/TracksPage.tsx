import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Clock, Filter } from 'lucide-react'
import { coursesApi } from '@/api/client'
import type { Track, DifficultyLevel } from '@/types'

const LEVELS: (DifficultyLevel | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced']
const TAGS = ['All', 'Core', 'AI/ML', 'Backend', 'Infrastructure', 'Data']

const STATIC_TRACKS: Track[] = [
  { id: 'python',        name: 'Python',                  description: 'From basics to advanced OOP, decorators, async & data pipelines.',        icon: '🐍', color: '#ffd43b', bgColor: 'rgba(255,212,59,.12)',  totalLessons: 28, level: 'Beginner',     tag: 'Core',           estimatedHours: 20 },
  { id: 'sql',           name: 'SQL & Databases',          description: 'SQL queries, joins, window functions, indexes, NoSQL, PostgreSQL.',        icon: '🗄️', color: '#4ade80', bgColor: 'rgba(74,222,128,.12)', totalLessons: 22, level: 'Beginner',     tag: 'Core',           estimatedHours: 15 },
  { id: 'ml',            name: 'Machine Learning',         description: 'Supervised & unsupervised learning, neural nets, model evaluation.',       icon: '🧠', color: '#a78bfa', bgColor: 'rgba(167,139,250,.12)',totalLessons: 42, level: 'Intermediate', tag: 'AI/ML',          estimatedHours: 40 },
  { id: 'java',          name: 'Java & Spring Boot',       description: 'Core Java, OOP, REST APIs with Spring Boot, microservices patterns.',      icon: '☕', color: '#f97316', bgColor: 'rgba(249,115,22,.12)', totalLessons: 35, level: 'Intermediate', tag: 'Backend',        estimatedHours: 35 },
  { id: 'cloud',         name: 'Cloud & DevOps',           description: 'AWS, GCP, Docker, Kubernetes, Terraform, CI/CD pipelines.',               icon: '☁️', color: '#38bdf8', bgColor: 'rgba(56,189,248,.12)', totalLessons: 30, level: 'Intermediate', tag: 'Infrastructure', estimatedHours: 30 },
  { id: 'nlp',           name: 'NLP & AI',                 description: 'Text processing, sentiment analysis, BERT, named entity recognition.',    icon: '💬', color: '#f472b6', bgColor: 'rgba(244,114,182,.12)',totalLessons: 32, level: 'Advanced',     tag: 'AI/ML',          estimatedHours: 35 },
  { id: 'llm',           name: 'Large Language Models',    description: 'GPT architecture, fine-tuning, RAG, LangChain, prompt engineering.',     icon: '✨', color: '#22d3ee', bgColor: 'rgba(34,211,238,.12)', totalLessons: 25, level: 'Advanced',     tag: 'AI/ML',          estimatedHours: 30 },
  { id: 'data-analysis', name: 'Data Analysis',            description: 'Pandas, NumPy, Matplotlib, Seaborn, statistical analysis & EDA.',        icon: '📊', color: '#fb923c', bgColor: 'rgba(251,146,60,.12)', totalLessons: 26, level: 'Beginner',     tag: 'Data',           estimatedHours: 25 },
]

export function TracksPage() {
  const navigate = useNavigate()
  const [levelFilter, setLevelFilter] = useState<string>('All')
  const [tagFilter, setTagFilter] = useState<string>('All')

  const { data } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => coursesApi.getTracks(),
  })

  const tracks: Track[] = data?.data?.data || STATIC_TRACKS

  const filtered = tracks.filter((t) => {
    const levelOk = levelFilter === 'All' || t.level === levelFilter
    const tagOk   = tagFilter   === 'All' || t.tag  === tagFilter
    return levelOk && tagOk
  })

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Learning Tracks</h1>
        <p className="text-gray-400 text-sm">
          {tracks.length} comprehensive tracks from beginner to expert. Each includes theory, live code, graphs & projects.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-500" />
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Level</span>
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                levelFilter === l
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}>
              {l}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tag</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TAGS.map((t) => (
            <button key={t} onClick={() => setTagFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tagFilter === t
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-5">
        {filtered.map((track) => (
          <TrackCard key={track.id} track={track} onClick={() => navigate(`/tracks/${track.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No tracks match the selected filters.
        </div>
      )}
    </div>
  )
}

function TrackCard({ track, onClick }: { track: Track; onClick: () => void }) {
  const progressPercent = (track as any).userProgressPercent ?? 0

  return (
    <div onClick={onClick}
      className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:bg-surface-2 hover:border-border-2 hover:-translate-y-1 transition-all group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
        style={{ background: track.bgColor }}>
        {track.icon}
      </div>
      <div className="text-sm font-semibold text-white mb-1">{track.name}</div>
      <div className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{track.description}</div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <BookOpen size={11} /> {track.totalLessons} lessons
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={11} /> {track.estimatedHours}h
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: track.bgColor, color: track.color }}>
          {track.level}
        </span>
        <span className="text-xs text-gray-500">{progressPercent}%</span>
      </div>
      <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%`, background: track.color }} />
      </div>
    </div>
  )
}
