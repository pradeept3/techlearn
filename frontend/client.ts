import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

// ─── Root cause fix ───────────────────────────────────────────────────────────
// Spring Boot context-path is /api (set in application.yml)
// Vite proxy forwards /api/* → http://localhost:8080/api/*
// So baseURL must be '' (empty) so axios calls /api/auth/login
// which Vite proxies to http://localhost:8080/api/auth/login  ✓
//
// If VITE_API_BASE_URL is set (e.g. in prod: https://api.techlearn.dev/api)
// axios calls that directly without going through the proxy.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''   // '' = use Vite proxy
const AI_BASE  = import.meta.env.VITE_AI_SERVICE_URL ?? '' // '' = use Vite proxy

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export const aiClient = axios.create({
  baseURL: AI_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// ─── Attach JWT to every request ─────────────────────────────────────────────
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}
apiClient.interceptors.request.use(attachToken)
aiClient.interceptors.request.use(attachToken)

// ─── Auto-refresh on 401 ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken })
        const newToken = data.token ?? data.data?.token
        useAuthStore.getState().setToken(newToken)
        localStorage.setItem('refreshToken', data.refreshToken ?? data.data?.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Helper: unwrap Spring Boot ApiResponse<T> wrapper ───────────────────────
// Spring Boot returns: { data: T, message: string, success: boolean }
// This helper extracts .data so callers don't need to chain .data.data
function unwrap<T>(response: any): T {
  // If response has a { data, success } shape (our ApiResponse wrapper), unwrap it
  if (response?.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data as T
  }
  return response?.data as T
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, password }),
  me: () => apiClient.get('/api/auth/me'),
  logout: () => apiClient.post('/api/auth/logout').catch(() => {}),
  refresh: (refreshToken: string) =>
    apiClient.post('/api/auth/refresh', { refreshToken }),
}

// ─── Courses API ──────────────────────────────────────────────────────────────
export const coursesApi = {
  getTracks:  () => apiClient.get('/api/tracks'),
  getTrack:   (id: string) => apiClient.get(`/api/tracks/${id}`),
  getLessons: (trackId: string) => apiClient.get(`/api/tracks/${trackId}/lessons`),
  getLesson:  (trackId: string, lessonId: string) =>
    apiClient.get(`/api/tracks/${trackId}/lessons/${lessonId}`),
  completeLesson: (lessonId: string) =>
    apiClient.post(`/api/lessons/${lessonId}/complete`),
  search: (query: string) =>
    apiClient.get('/api/search', { params: { q: query } }),
}

// ─── Progress API ─────────────────────────────────────────────────────────────
export const progressApi = {
  getUserProgress: () => apiClient.get('/api/progress/me'),
  getTrackProgress: (trackId: string) => apiClient.get(`/api/progress/track/${trackId}`),
  getStreak: () => apiClient.get('/api/progress/streak'),
  getLeaderboard: (period: 'week' | 'month' | 'all') =>
    apiClient.get('/api/leaderboard', { params: { period } }),
  getActivity: (days = 30) =>
    apiClient.get('/api/progress/activity', { params: { days } }),
}

// ─── Projects API ─────────────────────────────────────────────────────────────
export const projectsApi = {
  getProjects: () => apiClient.get('/api/projects'),
  getProject:  (id: string) => apiClient.get(`/api/projects/${id}`),
  submitProject: (id: string, githubUrl: string) =>
    apiClient.post(`/api/projects/${id}/submit`, { githubUrl }),
}

// ─── Case Studies API ─────────────────────────────────────────────────────────
export const caseStudiesApi = {
  getCaseStudies: (trackId?: string) =>
    apiClient.get('/api/case-studies', { params: trackId ? { trackId } : {} }),
  getCaseStudy: (id: string) => apiClient.get(`/api/case-studies/${id}`),
}

// ─── Notes API ────────────────────────────────────────────────────────────────
export const notesApi = {
  getNotes: (trackId?: string) =>
    apiClient.get('/api/notes', { params: trackId ? { trackId } : {} }),
  getNote:    (id: string) => apiClient.get(`/api/notes/${id}`),
  createNote: (note: any) => apiClient.post('/api/notes', note),
  updateNote: (id: string, note: any) => apiClient.put(`/api/notes/${id}`, note),
  deleteNote: (id: string) => apiClient.delete(`/api/notes/${id}`),
}

// ─── AI Chat API ──────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (sessionId: string, message: string, context?: string) =>
    aiClient.post('/chat', { session_id: sessionId, message, context }),
  runCode: (code: string, language: string) =>
    aiClient.post('/code/run', { code, language }),
  getSessions: () => aiClient.get('/chat/sessions'),
  deleteSession: (id: string) => aiClient.delete(`/chat/sessions/${id}`),
}

export default apiClient
