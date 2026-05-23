import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Star, Github, ExternalLink } from 'lucide-react'
import { projectsApi } from '@/api/client'

const STATIC_PROJECTS = [
  { id: '1', name: 'Stock Price Predictor', description: 'Build an ML model that predicts stock prices using LSTM neural networks, technical indicators, and historical data from Yahoo Finance API.', difficulty: 'Intermediate', technologies: ['Python', 'TensorFlow', 'Pandas', 'scikit-learn'], estimatedHours: 8, thumbnail: '📈', thumbBg: '#0f172a' },
  { id: '2', name: 'REST API with Spring Boot', description: 'Design and build a production-ready REST API with full CRUD, JWT authentication, PostgreSQL, Flyway migrations, and Swagger docs.', difficulty: 'Intermediate', technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'JWT'], estimatedHours: 10, thumbnail: '⚙️', thumbBg: '#1c1917' },
  { id: '3', name: 'Sentiment Analyzer Web App', description: 'Build a real-time sentiment analysis app using HuggingFace transformers, a Flask API backend, and a React frontend with live bar charts.', difficulty: 'Beginner', technologies: ['Python', 'NLP', 'Flask', 'React'], estimatedHours: 6, thumbnail: '💬', thumbBg: '#0c0a1e' },
  { id: '4', name: 'RAG-Powered Study Chatbot', description: 'Create a chatbot that answers questions about your uploaded notes using RAG, LangChain, ChromaDB, and the Claude/OpenAI API.', difficulty: 'Advanced', technologies: ['LLM', 'LangChain', 'Python', 'FastAPI'], estimatedHours: 12, thumbnail: '🤖', thumbBg: '#0a1628' },
  { id: '5', name: 'Real-time Analytics Dashboard', description: 'Build a live data dashboard with PostgreSQL, Spring Boot SSE, and a React frontend with Recharts, updating every 5 seconds.', difficulty: 'Intermediate', technologies: ['SQL', 'Spring Boot', 'React', 'Docker'], estimatedHours: 10, thumbnail: '📊', thumbBg: '#0a1f0a' },
  { id: '6', name: 'Image Classifier CNN', description: 'Train a convolutional neural network from scratch to classify 10 categories, then deploy as a REST API on AWS Lambda + API Gateway.', difficulty: 'Advanced', technologies: ['Python', 'TensorFlow', 'CNN', 'AWS'], estimatedHours: 14, thumbnail: '🖼️', thumbBg: '#1a0a1e' },
  { id: '7', name: 'CI/CD Pipeline with GitHub Actions', description: 'Build a complete DevOps pipeline: containerize with Docker, run tests, push to ECR, and deploy to ECS with zero-downtime rolling updates.', difficulty: 'Intermediate', technologies: ['Docker', 'AWS', 'GitHub Actions', 'Bash'], estimatedHours: 8, thumbnail: '🔄', thumbBg: '#0f1f2e' },
  { id: '8', name: 'Full-Stack Todo App', description: 'Classic full-stack: React frontend, Spring Boot backend, PostgreSQL, JWT auth, Docker Compose. The perfect interview portfolio project.', difficulty: 'Beginner', technologies: ['React', 'Java', 'PostgreSQL', 'Docker'], estimatedHours: 6, thumbnail: '✅', thumbBg: '#0f2010' },
]

const DIFF_COLORS: Record<string, string> = {
  Beginner:     'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced:     'bg-red-500/10   text-red-400   border-red-500/20',
}
const DIFF_STARS: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

export function ProjectsPage() {
  const [filter, setFilter] = useState('All')

  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
  })

  const projects = data?.data?.data || STATIC_PROJECTS
  const filtered = filter === 'All' ? projects : projects.filter((p: any) => p.difficulty === filter)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Mini Projects</h1>
        <p className="text-gray-400 text-sm">
          Hands-on projects to cement your skills. From beginner scripts to full-stack apps. Each comes with step-by-step guidance.
        </p>
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-6">
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
          <button key={d} onClick={() => setFilter(d)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === d ? 'bg-accent text-white' : 'bg-surface border border-border text-gray-400 hover:text-white'
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((project: any) => (
          <div key={project.id}
            className="bg-surface border border-border rounded-xl overflow-hidden hover:border-border-2 hover:-translate-y-1 transition-all cursor-pointer group">
            {/* Thumbnail */}
            <div className="h-24 flex items-center justify-center text-4xl relative overflow-hidden"
              style={{ background: project.thumbBg }}>
              {project.thumbnail}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <button className="flex items-center gap-1 text-xs text-white bg-surface border border-border px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                  <Github size={12} /> View Code
                </button>
                <button className="flex items-center gap-1 text-xs text-accent border border-accent px-3 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-colors">
                  Start <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-1.5">{project.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{project.description}</p>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.technologies.map((tech: string) => (
                  <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-bg-primary border border-border text-gray-400">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${DIFF_COLORS[project.difficulty]}`}>
                  {'★'.repeat(DIFF_STARS[project.difficulty])} {project.difficulty}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={11} /> ~{project.estimatedHours}h
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
