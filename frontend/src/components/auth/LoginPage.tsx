import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      login(res.data.user, res.data.token, res.data.refreshToken)
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
              TL
            </div>
            <span className="font-display font-bold text-3xl text-white">
              Tech<span className="text-accent">Learn</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">Sign in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Don't have an account? </span>
            <Link to="/register" className="text-sm text-accent hover:text-white transition-colors">
              Sign up free
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-surface rounded-lg border border-border">
            <p className="text-xs text-gray-500 text-center mb-2">Demo credentials</p>
            <p className="text-xs font-mono text-center text-gray-400">demo@techlearn.dev / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
