import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, Flame, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { coursesApi } from '@/api/client'

export function Topbar() {
  const { setSidebarOpen, sidebarOpen, setSearchQuery } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (val: string) => {
    setQuery(val)
    setSearchQuery(val)
    if (val.length > 2) setSearching(true)
    else setSearching(false)
  }

  const clearSearch = () => {
    setQuery('')
    setSearchQuery('')
    setSearching(false)
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-6 h-[60px] border-b border-border"
      style={{ background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)' }}>
      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search lessons, topics, projects…"
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
        />
        {query && (
          <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Streak */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg">
            <Flame size={15} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">{user.streak}</span>
            <span className="text-xs text-gray-500">day streak</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border text-gray-400 hover:text-white transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-bg-primary" />
        </button>

        {/* XP badge */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
            <span className="text-xs font-bold text-accent">⚡ {user.xp.toLocaleString()} XP</span>
          </div>
        )}

        {/* Avatar */}
        {user && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-accent transition-all"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)' }}
            onClick={() => navigate('/progress')}
            title={user.name}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ width: '65%', background: 'linear-gradient(90deg, #4f8ef7, #6366f1, #22d3ee)' }} />
    </header>
  )
}
