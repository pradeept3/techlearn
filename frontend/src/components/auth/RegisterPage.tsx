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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

const TRACKS = ['Python', 'Machine Learning', 'SQL', 'Java', 'Cloud', 'LLMs', 'Data Analysis', 'NLP']

export function RegisterPage() {
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
      const res = await authApi.register(data.name, data.email, data.password)
      login(res.data.user, res.data.token, res.data.refreshToken)
      toast.success(`Account created! Welcome to TechLearn, ${res.data.user.name}! 🚀`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
      </div>

      <div className="w-full max-w-md">
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
          <p className="text-gray-400 text-sm">Join 10,000+ learners mastering modern tech</p>
        </div>

        {/* What you'll learn */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {TRACKS.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-gray-400">
              {t}
            </span>
          ))}
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-6">Create your account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                {...register('name')}
                placeholder="Jane Smith"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
                  placeholder="At least 8 characters"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Start Learning Free →'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-sm text-accent hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
