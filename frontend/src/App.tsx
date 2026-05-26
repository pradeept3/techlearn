import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { TracksPage } from '@/components/courses/TracksPage'
import { TrackDetailPage } from '@/components/courses/TrackDetailPage'
import { LessonPage } from '@/components/courses/LessonPage'
import { PlaygroundPage } from '@/components/courses/PlaygroundPage'
import { ProjectsPage } from '@/components/projects/ProjectsPage'
import { CaseStudiesPage } from '@/components/courses/CaseStudiesPage'
import { NotesPage } from '@/components/notes/NotesPage'
import { ProgressPage } from '@/components/dashboard/ProgressPage'
import { AdminPage } from '@/components/admin/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2338',
              color: '#e8edf5',
              border: '1px solid #2a3550',
              fontFamily: 'Space Grotesk, sans-serif',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="tracks" element={<TracksPage />} />
            <Route path="tracks/:trackId" element={<TrackDetailPage />} />
            <Route path="tracks/:trackId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="case-studies" element={<CaseStudiesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="progress" element={<ProgressPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
