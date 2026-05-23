import { useQuery } from '@tanstack/react-query'
import { progressApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Trophy, Flame, Zap, BookOpen, Target, Medal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const TRACK_COLORS: Record<string, string> = {
  python: '#ffd43b', sql: '#4ade80', ml: '#a78bfa', java: '#f97316',
  cloud: '#38bdf8', nlp: '#f472b6', llm: '#22d3ee', 'data-analysis': '#fb923c',
}

const TRACK_ICONS: Record<string, string> = {
  python: '🐍', sql: '🗄️', ml: '🧠', java: '☕',
  cloud: '☁️', nlp: '💬', llm: '✨', 'data-analysis': '📊',
}

const DEMO_ACTIVITY = [
  { date: 'Mon', minutes: 45 }, { date: 'Tue', minutes: 60 },
  { date: 'Wed', minutes: 30 }, { date: 'Thu', minutes: 51 },
  { date: 'Fri', minutes: 54 }, { date: 'Sat', minutes: 21 },
  { date: 'Sun', minutes: 12 },
]

const DEMO_PROGRESS = [
  { trackId: 'python', progressPercent: 25, xpEarned: 350, completedLessons: 7, totalLessons: 28 },
  { trackId: 'ml', progressPercent: 7, xpEarned: 150, completedLessons: 3, totalLessons: 42 },
  { trackId: 'sql', progressPercent: 0, xpEarned: 0, completedLessons: 0, totalLessons: 22 },
  { trackId: 'java', progressPercent: 0, xpEarned: 0, completedLessons: 0, totalLessons: 35 },
  { trackId: 'cloud', progressPercent: 0, xpEarned: 0, completedLessons: 0, totalLessons: 30 },
  { trackId: 'llm', progressPercent: 0, xpEarned: 0, completedLessons: 0, totalLessons: 25 },
]

const DEMO_LEADERBOARD = [
  { rank: 1, name: 'Alex K.', xp: 2840, streak: 32, isCurrentUser: false, color: '#ffd43b' },
  { rank: 2, name: 'Sam L.',  xp: 2620, streak: 21, isCurrentUser: false, color: '#94a3b8' },
  { rank: 3, name: 'You',     xp: 2100, streak: 12, isCurrentUser: true,  color: '#f97316' },
  { rank: 4, name: 'Maria G.',xp: 1980, streak: 18, isCurrentUser: false, color: '#4ade80' },
  { rank: 5, name: 'David R.',xp: 1840, streak: 9,  isCurrentUser: false, color: '#60a5fa' },
]

export function ProgressPage() {
  const user = useAuthStore((s) => s.user)

  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.getUserProgress(),
  })

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => progressApi.getLeaderboard('week'),
  })

  const progress = progressData?.data?.data
  const leaderboard = leaderboardData?.data?.data || DEMO_LEADERBOARD
  const trackProgress = progress?.tracks || DEMO_PROGRESS

  // Build 30-day streak calendar
  const today = new Date()
  const streakDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    const isToday = i === 29
    const inStreak = i >= 30 - (user?.streak ?? 0)
    return { date: d, isToday, active: inStreak || isToday }
  })

  const totalXp = trackProgress.reduce((sum: number, t: any) => sum + (t.xpEarned || 0), 0)
  const totalCompleted = trackProgress.reduce((sum: number, t: any) => sum + (t.completedLessons || 0), 0)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Progress</h1>
        <p className="text-gray-400 text-sm">Track your learning journey, streaks, and leaderboard ranking.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Zap, color: 'text-accent', bg: 'rgba(79,142,247,.1)', val: totalXp.toLocaleString(), label: 'Total XP', sub: `Level ${user?.level ?? 1}` },
          { icon: Flame, color: 'text-orange-400', bg: 'rgba(249,115,22,.1)', val: `🔥 ${user?.streak ?? 0}`, label: 'Day Streak', sub: 'Keep it up!' },
          { icon: BookOpen, color: 'text-green-400', bg: 'rgba(16,185,129,.1)', val: totalCompleted, label: 'Lessons Done', sub: 'of 240+ total' },
          { icon: Target, color: 'text-purple-400', bg: 'rgba(167,139,250,.1)', val: '3', label: 'Projects Built', sub: '5 more unlocked' },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-gray-400 font-medium">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak calendar + Leaderboard */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Streak */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <Flame size={17} className="text-orange-400" /> Daily Streak — Last 30 Days
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-4">🔥 {user?.streak ?? 12} Days</div>
          <div className="flex flex-wrap gap-1.5">
            {streakDays.map((day, i) => (
              <div key={i}
                title={day.date.toLocaleDateString()}
                className="w-5 h-5 rounded-sm transition-all"
                style={{
                  background: day.isToday ? '#4f8ef7'
                    : day.active ? '#10b981'
                    : '#1a2338',
                  border: day.isToday ? '1px solid #6366f1' : 'none',
                }} />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Active</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent inline-block" /> Today</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-surface-2 inline-block border border-border" /> Inactive</span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <Trophy size={17} className="text-amber-400" /> Weekly Leaderboard
          </div>
          <div className="space-y-1">
            {leaderboard.map((entry: any) => (
              <div key={entry.rank}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  entry.isCurrentUser ? 'bg-accent/10 border border-accent/20' : 'hover:bg-surface-2'
                }`}>
                <div className={`w-6 text-center text-sm font-bold ${
                  entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                }`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: entry.color }}>
                  {(entry.name || '?')[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {entry.name} {entry.isCurrentUser && <span className="text-xs text-accent">(you)</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Flame size={10} className="text-orange-400" /> {entry.streak}d streak
                  </div>
                </div>
                <div className="text-sm font-bold text-accent">{entry.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly activity chart */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <div className="text-sm font-semibold text-white mb-4">📈 Weekly Learning Activity (minutes)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={DEMO_ACTIVITY} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#5a6880', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a6880', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a2338', border: '1px solid #2a3550', borderRadius: 8, color: '#e8edf5', fontSize: 13 }}
              cursor={{ fill: 'rgba(79,142,247,0.06)' }}
              formatter={(v: number) => [`${v} min`, 'Learning time']}
            />
            <Bar dataKey="minutes" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Track progress breakdown */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="text-sm font-semibold text-white mb-5">Track Progress Breakdown</div>
        <div className="space-y-4">
          {trackProgress.map((t: any) => (
            <div key={t.trackId} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${TRACK_COLORS[t.trackId]}20` }}>
                {TRACK_ICONS[t.trackId] || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-white capitalize">{t.trackId.replace('-', ' ')}</span>
                  <span className="text-gray-400 text-xs">
                    {t.completedLessons} / {t.totalLessons} lessons · {t.xpEarned} XP
                  </span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.progressPercent}%`, background: TRACK_COLORS[t.trackId] || '#4f8ef7' }} />
                </div>
              </div>
              <div className="text-sm font-semibold w-10 text-right flex-shrink-0"
                style={{ color: TRACK_COLORS[t.trackId] }}>
                {t.progressPercent}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
