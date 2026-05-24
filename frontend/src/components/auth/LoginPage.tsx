import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Wifi } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

// ─── Demo user — works even when backend is unreachable ───────────────────────
const DEMO_USER = {
  id: 'demo-001',
  name: 'Demo User',
  email: 'demo@techlearn.dev',
  role: 'student' as const,
  xp: 847,
  streak: 12,
  level: 2,
  createdAt: new Date().toISOString(),
}
const DEMO_TOKEN = 'demo-jwt-token-not-real'

export function LoginPage() {
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Auto-fill demo credentials
  const fillDemo = () => {
    setValue('email', 'demo@techlearn.dev')
    setValue('password', 'password123')
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    // ── Demo shortcut: bypass backend entirely ─────────────────────────────
    if (
      data.email.trim().toLowerCase() === 'demo@techlearn.dev' &&
      data.password === 'password123'
    ) {
      await new Promise((r) => setTimeout(r, 600)) // feel realistic
      login(DEMO_USER, DEMO_TOKEN, DEMO_TOKEN + '-refresh')
      toast.success('Welcome to TechLearn, Demo User! 🎉')
      navigate('/')
      setLoading(false)
      return
    }

    // ── Real backend login ─────────────────────────────────────────────────
    try {
      const res = await authApi.login(data.email, data.password)

      // Handle both response shapes:
      //   Shape A (direct):  { token, refreshToken, user }
      //   Shape B (wrapped): { data: { token, refreshToken, user }, success: true }
      const payload = res.data?.success !== undefined ? res.data.data : res.data
      const { token, refreshToken, user } = payload

      login(user, token, refreshToken)
      toast.success(`Welcome back, ${user.name}! 🎉`)
      setBackendOk(true)
      navigate('/')
    } catch (err: any) {
      const status  = err?.response?.status
      const message = err?.response?.data?.message ?? err?.response?.data?.error

      if (!err.response) {
        // Network error — backend unreachable
        setBackendOk(false)
        toast.error('Cannot reach the server. Use the demo account to explore the UI.')
      } else if (status === 401 || status === 400) {
        toast.error(message || 'Invalid email or password')
      } else if (status === 404) {
        toast.error('No account found with that email. Please register.')
      } else {
        toast.error(message || `Server error (${status}). Try the demo account.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
              TL
            </div>
            <span className="font-bold text-3xl text-white">
              Tech<span style={{ color: '#4f8ef7' }}>Learn</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">Sign in to continue your learning journey</p>
        </div>

        {/* Backend status banner */}
        {backendOk === false && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <Wifi size={15} />
            Backend offline — use demo credentials to explore the app
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: '#0f1525', border: '1px solid #2a3550' }}>
          <h1 className="text-xl font-semibold text-white mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                style={{ background: '#1a2338', border: '1px solid #2a3550' }}
                onFocus={(e) => e.target.style.borderColor = '#4f8ef7'}
                onBlur={(e)  => e.target.style.borderColor = '#2a3550'}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                  style={{ background: '#1a2338', border: '1px solid #2a3550' }}
                  onFocus={(e) => e.target.style.borderColor = '#4f8ef7'}
                  onBlur={(e)  => e.target.style.borderColor = '#2a3550'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="text-blue-400 hover:text-white transition-colors">
              Sign up free
            </Link>
          </div>

          {/* Demo credentials box */}
          <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid #2a3550' }}>
            <div className="px-4 py-2" style={{ background: '#141c30' }}>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Demo Account</p>
            </div>
            <div className="px-4 py-3" style={{ background: '#1a2338' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-300">demo@techlearn.dev</p>
                  <p className="text-xs font-mono text-gray-300 mt-0.5">password123</p>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.3)' }}>
                  Auto-fill
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ✓ Works offline — no backend required for demo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
