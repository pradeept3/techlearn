import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Star, ExternalLink } from 'lucide-react'
import { caseStudiesApi } from '@/api/client'

const STATIC_CASES = [
  { id: '1', title: 'How Netflix Recommends Your Next Show', company: 'Netflix', trackId: 'ml', tag: 'Machine Learning', tagColor: '#a78bfa', tagBg: 'rgba(167,139,250,.1)', description: 'A deep dive into collaborative filtering, matrix factorization, and the $1M Netflix Prize algorithm that changed recommendation systems forever.', readTimeMinutes: 12, rating: 4.9, ratingCount: 312, publishedAt: '2024-01-15' },
  { id: '2', title: 'GPT Architecture: Attention is All You Need', company: 'OpenAI', trackId: 'llm', tag: 'LLMs & NLP', tagColor: '#22d3ee', tagBg: 'rgba(34,211,238,.1)', description: 'From the original 2017 transformer paper to GPT-4 — how attention mechanisms revolutionized natural language processing and AI.', readTimeMinutes: 18, rating: 5.0, ratingCount: 284, publishedAt: '2024-02-01' },
  { id: '3', title: 'How Uber Scaled to 1 Billion Trips', company: 'Uber', trackId: 'cloud', tag: 'Cloud & Scale', tagColor: '#38bdf8', tagBg: 'rgba(56,189,248,.1)', description: 'The microservices migration, real-time geospatial data, dynamic pricing algorithms, and the tech stack behind the world\'s biggest rideshare.', readTimeMinutes: 15, rating: 4.8, ratingCount: 198, publishedAt: '2024-01-28' },
  { id: '4', title: 'COVID-19 Data: How Analysts Shaped Policy', company: 'WHO/CDC', trackId: 'data-analysis', tag: 'Data Analysis', tagColor: '#fb923c', tagBg: 'rgba(251,146,60,.1)', description: 'Epidemiological modeling, R-values, statistical pitfalls, and how data visualization influenced public health decisions globally.', readTimeMinutes: 20, rating: 4.7, ratingCount: 289, publishedAt: '2024-03-10' },
  { id: '5', title: 'Instagram Database at 1 Billion Users', company: 'Instagram', trackId: 'sql', tag: 'SQL & Data', tagColor: '#4ade80', tagBg: 'rgba(74,222,128,.1)', description: 'How Instagram chose PostgreSQL over NoSQL, sharded databases, handled photo metadata at petabyte scale, and avoided common pitfalls.', readTimeMinutes: 14, rating: 4.9, ratingCount: 241, publishedAt: '2024-02-20' },
  { id: '6', title: 'Spring Boot at LinkedIn: Real Microservices', company: 'LinkedIn', trackId: 'java', tag: 'Java & Backend', tagColor: '#f97316', tagBg: 'rgba(249,115,22,.1)', description: 'Breaking a monolith into services, API gateway patterns, service mesh, and the trade-offs LinkedIn faced scaling its Java backend.', readTimeMinutes: 16, rating: 4.8, ratingCount: 176, publishedAt: '2024-03-05' },
]

const TAGS = ['All', 'Machine Learning', 'LLMs & NLP', 'Cloud & Scale', 'Data Analysis', 'SQL & Data', 'Java & Backend']

export function CaseStudiesPage() {
  const [activeTag, setActiveTag] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['case-studies'],
    queryFn: () => caseStudiesApi.getCaseStudies(),
  })

  const cases = data?.data?.data || STATIC_CASES
  const filtered = activeTag === 'All' ? cases : cases.filter((c: any) => c.tag === activeTag)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Case Studies</h1>
        <p className="text-gray-400 text-sm">Real-world applications of technology — from Netflix's algorithm to GPT's architecture.</p>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTag === tag ? 'bg-accent text-white' : 'bg-surface border border-border text-gray-400 hover:text-white'
            }`}>
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5">
        {filtered.map((c: any) => (
          <div key={c.id}
            className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:bg-surface-2 hover:border-border-2 hover:-translate-y-0.5 transition-all"
            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: c.tagBg, color: c.tagColor, border: `1px solid ${c.tagColor}30` }}>
                {c.tag}
              </span>
              <span className="text-xs text-gray-500 ml-auto">{c.company}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{c.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{c.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={11} /> {c.readTimeMinutes} min read</span>
              <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {c.rating} ({c.ratingCount})</span>
              <span className="ml-auto flex items-center gap-1 text-accent hover:text-white transition-colors">
                Read <ExternalLink size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
