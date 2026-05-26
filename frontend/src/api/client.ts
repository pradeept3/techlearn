import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

// ─── Backend API client (Spring Boot) ────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── AI Service client (FastAPI) ─────────────────────────────────────────────
export const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL || '/ai',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // longer for LLM responses
})

// ─── Request interceptor: attach JWT ────────────────────────────────────────
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

apiClient.interceptors.request.use(attachToken)
aiClient.interceptors.request.use(attachToken)

// ─── Response interceptor: handle 401 / refresh token ───────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        )
        useAuthStore.getState().setToken(data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
}

// ─── Courses API ──────────────────────────────────────────────────────────────
export const coursesApi = {
  getTracks: () => apiClient.get('/tracks'),
  getTrack: (id: string) => apiClient.get(`/tracks/${id}`),
  getLessons: (trackId: string) => apiClient.get(`/tracks/${trackId}/lessons`),
  getLesson: (trackId: string, lessonId: string) =>
    apiClient.get(`/tracks/${trackId}/lessons/${lessonId}`),
  completeLesson: (lessonId: string) =>
    apiClient.post(`/lessons/${lessonId}/complete`),
  searchLessons: (query: string) =>
    apiClient.get('/search', { params: { q: query } }),
}

// ─── Progress API ─────────────────────────────────────────────────────────────
export const progressApi = {
  getUserProgress: () => apiClient.get('/progress/me'),
  getTrackProgress: (trackId: string) => apiClient.get(`/progress/track/${trackId}`),
  getStreak: () => apiClient.get('/progress/streak'),
  getLeaderboard: (period: 'week' | 'month' | 'all') =>
    apiClient.get('/leaderboard', { params: { period } }),
  getActivity: () => apiClient.get('/progress/activity'),
}

// ─── Projects API ─────────────────────────────────────────────────────────────
export const projectsApi = {
  getProjects: () => apiClient.get('/projects'),
  getProject: (id: string) => apiClient.get(`/projects/${id}`),
  submitProject: (id: string, githubUrl: string) =>
    apiClient.post(`/projects/${id}/submit`, { githubUrl }),
}

// ─── Case Studies API ─────────────────────────────────────────────────────────
export const caseStudiesApi = {
  getCaseStudies: (trackId?: string) =>
    apiClient.get('/case-studies', { params: trackId ? { trackId } : {} }),
  getCaseStudy: (id: string) => apiClient.get(`/case-studies/${id}`),
}

// ─── Notes API ────────────────────────────────────────────────────────────────
export const notesApi = {
  getNotes: (trackId?: string) =>
    apiClient.get('/notes', { params: trackId ? { trackId } : {} }),
  getNote: (id: string) => apiClient.get(`/notes/${id}`),
  createNote: (note: Partial<import('@/types').Note>) => apiClient.post('/notes', note),
  updateNote: (id: string, note: Partial<import('@/types').Note>) =>
    apiClient.put(`/notes/${id}`, note),
  deleteNote: (id: string) => apiClient.delete(`/notes/${id}`),
}

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  createTrack: (track: any) => apiClient.post('/admin/tracks', track),
  createLesson: (trackId: string, lesson: any) => apiClient.post(`/admin/tracks/${trackId}/lessons`, lesson),
  addVideoToLesson: (trackId: string, lessonId: string, video: any) =>
    apiClient.post(`/admin/tracks/${trackId}/lessons/${lessonId}/videos`, video),
  createTechnology: (technology: any) => apiClient.post('/admin/technologies', technology),
}

// ─── Technology API ─────────────────────────────────────────────────────────
export const technologyApi = {
  getTechnologies: () => apiClient.get('/technologies'),
}

// ─── AI Chat API (FastAPI) ────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (sessionId: string, message: string, context?: string) =>
    aiClient.post('/chat', { session_id: sessionId, message, context }),

  // Streaming endpoint — returns EventSource URL
  streamUrl: (sessionId: string) =>
    `${import.meta.env.VITE_AI_SERVICE_URL}/chat/stream/${sessionId}`,

  getSessions: () => aiClient.get('/chat/sessions'),
  getSession: (id: string) => aiClient.get(`/chat/sessions/${id}`),
  deleteSession: (id: string) => aiClient.delete(`/chat/sessions/${id}`),

  // Run code in sandbox
  runCode: (code: string, language: string) =>
    aiClient.post('/code/run', { code, language }),
}

export default apiClient
