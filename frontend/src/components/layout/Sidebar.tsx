import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { authApi } from '@/api/client'
import toast from 'react-hot-toast'
import {
  Home, Grid, Terminal, Package, BookOpen, FileText,
  Trophy, Settings, Brain, Database, Cloud, Cpu,
  MessageSquare, ChevronLeft, Flame, Sparkles, BarChart2, Coffee
} from 'lucide-react'

const mainNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/tracks', icon: Grid, label: 'Learning Tracks', badge: '8' },
  { to: '/playground', icon: Terminal, label: 'Code Playground' },
  { to: '/projects', icon: Package, label: 'Projects' },
  { to: '/case-studies', icon: BookOpen, label: 'Case Studies' },
  { to: '/notes', icon: FileText, label: 'Handwritten Notes' },
]

const techNav = [
  { to: '/tracks/python', icon: () => <span>🐍</span>, label: 'Python' },
  { to: '/tracks/sql', icon: Database, label: 'SQL & Databases' },
  { to: '/tracks/ml', icon: Brain, label: 'Machine Learning', badge: 'New', badgeColor: 'bg-green-500' },
  { to: '/tracks/java', icon: Coffee, label: 'Java & Spring Boot' },
  { to: '/tracks/cloud', icon: Cloud, label: 'Cloud & DevOps' },
  { to: '/tracks/nlp', icon: MessageSquare, label: 'NLP & AI' },
  { to: '/tracks/llm', icon: Sparkles, label: 'LLMs', badge: 'New', badgeColor: 'bg-green-500' },
  { to: '/tracks/data-analysis', icon: BarChart2, label: 'Data Analysis' },
]

const accountNav = [
  { to: '/progress', icon: Trophy, label: 'My Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, toggleChat } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  if (!sidebarOpen) return null

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-bg-secondary border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
          TL
        </div>
        <span className="font-display font-bold text-xl text-white">
          Tech<span className="text-accent">Learn</span>
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto text-gray-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)' }}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <Flame size={12} className="text-orange-400" />
                {user.streak} day streak · {user.xp.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <NavSection label="Main">
          {mainNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </NavSection>

        <NavSection label="Technologies">
          {techNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </NavSection>

        <NavSection label="Account">
          {accountNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </NavSection>
      </nav>

      {/* AI Tutor button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={toggleChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
          style={{
            background: 'rgba(79,142,247,0.08)',
            borderColor: 'rgba(79,142,247,0.2)',
          }}
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
          <div className="text-left">
            <div className="text-sm font-semibold text-white">AI Tutor — Aria</div>
            <div className="text-xs text-gray-400">Ask me anything</div>
          </div>
          <MessageSquare size={18} className="ml-auto text-accent" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-2 text-xs text-gray-500 hover:text-white transition-colors py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  )
}

interface SidebarLinkProps {
  to: string
  icon: React.ElementType
  label: string
  badge?: string
  badgeColor?: string
}

function SidebarLink({ to, icon: Icon, label, badge, badgeColor = 'bg-accent' }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 mx-1 my-0.5 rounded-lg text-sm transition-all relative ${
          isActive
            ? 'bg-surface-2 text-accent font-medium'
            : 'text-gray-400 hover:bg-surface hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
          )}
          <Icon size={17} className="flex-shrink-0" />
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
