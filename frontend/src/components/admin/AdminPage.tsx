import { useEffect, useState, type ChangeEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, BookOpen, Layers, Video, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, coursesApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Track } from '@/types'

function unwrapResponse<T>(res: any): T {
  return res.data?.success !== undefined ? res.data.data : res.data
}

const DEFAULT_TRACK_FORM = {
  id: '',
  name: '',
  description: '',
  icon: '📘',
  color: '#4f46e5',
  bgColor: 'rgba(79,70,229,0.12)',
  estimatedHours: 10,
  level: 'Beginner',
  tag: 'Core',
}

const DEFAULT_TECHNOLOGY_FORM = {
  name: '',
  category: 'AI/ML',
  description: '',
  icon: '🧠',
}

const DEFAULT_LESSON_FORM = {
  title: '',
  slug: '',
  order: 1,
  type: 'text',
  durationMinutes: 20,
  contentMarkdown: '',
  summary: '',
  objectives: '',
}

const DEFAULT_VIDEO_FORM = {
  title: '',
  description: '',
  url: '',
  durationMinutes: 5,
}

export function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const [trackForm, setTrackForm] = useState(DEFAULT_TRACK_FORM)
  const [technologyForm, setTechnologyForm] = useState(DEFAULT_TECHNOLOGY_FORM)
  const [lessonForm, setLessonForm] = useState(DEFAULT_LESSON_FORM)
  const [videoForm, setVideoForm] = useState(DEFAULT_VIDEO_FORM)
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('')

  const {
    data: tracksResponse,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ['admin-tracks'],
    queryFn: () => coursesApi.getTracks(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const tracks: Track[] = (tracksResponse as any)?.data?.data || []

  useEffect(() => {
    if (!selectedTrackId && tracks.length) {
      setSelectedTrackId(tracks[0].id)
    }
  }, [tracks, selectedTrackId])

  const {
    data: lessonsResponse,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ['admin-lessons', selectedTrackId],
    queryFn: () => coursesApi.getLessons(selectedTrackId),
    enabled: Boolean(selectedTrackId),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const lessons = (lessonsResponse as any)?.data?.data || []

  useEffect(() => {
    if (!selectedLessonId && lessons.length) {
      setSelectedLessonId(lessons[0].id)
    }
  }, [lessons, selectedLessonId])

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="rounded-3xl border border-border p-10 bg-surface">
          <h1 className="text-2xl font-semibold text-white mb-3">Admin access required</h1>
          <p className="text-gray-400">You need to be signed in as an administrator to use this page.</p>
        </div>
      </div>
    )
  }

  const handleChange = (setter: any) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setter((prev: any) => ({ ...prev, [name]: value }))
  }

  const createTrack = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await adminApi.createTrack({
        ...trackForm,
        estimatedHours: Number(trackForm.estimatedHours),
      })
      unwrapResponse(response)
      toast.success('Track created successfully')
      setTrackForm(DEFAULT_TRACK_FORM)
      await refetchTracks()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create track')
    }
  }

  const createTechnology = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await adminApi.createTechnology(technologyForm)
      unwrapResponse(response)
      toast.success('Technology created successfully')
      setTechnologyForm(DEFAULT_TECHNOLOGY_FORM)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create technology')
    }
  }

  const createLesson = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedTrackId) {
      toast.error('Please select a track first')
      return
    }

    try {
      const response = await adminApi.createLesson(selectedTrackId, {
        title: lessonForm.title,
        slug: lessonForm.slug,
        order: Number(lessonForm.order),
        type: lessonForm.type,
        durationMinutes: Number(lessonForm.durationMinutes),
        contentMarkdown: lessonForm.contentMarkdown,
        summary: lessonForm.summary,
        objectives: lessonForm.objectives
          .split(',')
          .map((objective) => objective.trim())
          .filter(Boolean),
        quiz: null,
      })
      const result: any = unwrapResponse(response)
      setLessonForm(DEFAULT_LESSON_FORM)
      await refetchLessons()
      toast.success(`Lesson “${result.title}” created for ${selectedTrackId}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create lesson')
    }
  }

  const addVideo = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedTrackId || !selectedLessonId) {
      toast.error('Please select a track and lesson')
      return
    }

    try {
      await adminApi.addVideoToLesson(selectedTrackId, selectedLessonId, {
        title: videoForm.title,
        description: videoForm.description,
        url: videoForm.url,
        durationMinutes: Number(videoForm.durationMinutes),
      })
      setVideoForm(DEFAULT_VIDEO_FORM)
      toast.success('Video added to lesson')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add video')
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-gray-400">Admin Workspace</p>
          <h1 className="text-3xl font-semibold text-white">Authoring Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
            <Shield size={16} /> Admin only
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
            <BookOpen size={16} /> {tracks.length} tracks
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
            <Layers size={16} /> {lessons.length} lessons available
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-accent" />
            <div>
              <h2 className="text-xl font-semibold text-white">Create Technology</h2>
              <p className="text-sm text-gray-400">Register a new technology category for the course library.</p>
            </div>
          </div>

          <form onSubmit={createTechnology} className="space-y-4">
            <Field label="Name" name="name" value={technologyForm.name} onChange={handleChange(setTechnologyForm)} />
            <Field label="Category" name="category" value={technologyForm.category} onChange={handleChange(setTechnologyForm)} />
            <Field label="Description" name="description" value={technologyForm.description} onChange={handleChange(setTechnologyForm)} textarea />
            <Field label="Icon" name="icon" value={technologyForm.icon} onChange={handleChange(setTechnologyForm)} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-2">
              <Sparkles size={16} /> Create Technology
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-accent" />
            <div>
              <h2 className="text-xl font-semibold text-white">Create Track</h2>
              <p className="text-sm text-gray-400">Add a new learning track that students can explore.</p>
            </div>
          </div>

          <form onSubmit={createTrack} className="space-y-4">
            <Field label="ID" name="id" value={trackForm.id} onChange={handleChange(setTrackForm)} help="Unique slug identifier" />
            <Field label="Name" name="name" value={trackForm.name} onChange={handleChange(setTrackForm)} />
            <Field label="Description" name="description" value={trackForm.description} onChange={handleChange(setTrackForm)} textarea />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Icon" name="icon" value={trackForm.icon} onChange={handleChange(setTrackForm)} />
              <Field label="Tag" name="tag" value={trackForm.tag} onChange={handleChange(setTrackForm)} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Level" name="level" value={trackForm.level} onChange={handleChange(setTrackForm)} />
              <Field label="Hours" name="estimatedHours" value={String(trackForm.estimatedHours)} onChange={handleChange(setTrackForm)} />
              <Field label="Color" name="color" value={trackForm.color} onChange={handleChange(setTrackForm)} type="color" />
            </div>
            <Field label="Background Color" name="bgColor" value={trackForm.bgColor} onChange={handleChange(setTrackForm)} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-2">
              <BookOpen size={16} /> Create Track
            </button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <Layers size={20} className="text-accent" />
            <div>
              <h2 className="text-xl font-semibold text-white">Create Lesson</h2>
              <p className="text-sm text-gray-400">Add new lessons to a selected track.</p>
            </div>
          </div>

          <form onSubmit={createLesson} className="space-y-4">
            <SelectField
              label="Track"
              value={selectedTrackId}
              onChange={(event) => setSelectedTrackId(event.target.value)}
              options={tracks.map((track) => ({ value: track.id, label: track.name }))}
            />
            <Field label="Title" name="title" value={lessonForm.title} onChange={handleChange(setLessonForm)} />
            <Field label="Slug" name="slug" value={lessonForm.slug} onChange={handleChange(setLessonForm)} />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Order" name="order" value={String(lessonForm.order)} onChange={handleChange(setLessonForm)} type="number" />
              <Field label="Type" name="type" value={lessonForm.type} onChange={handleChange(setLessonForm)} />
              <Field label="Duration" name="durationMinutes" value={String(lessonForm.durationMinutes)} onChange={handleChange(setLessonForm)} type="number" />
            </div>
            <Field label="Summary" name="summary" value={lessonForm.summary} onChange={handleChange(setLessonForm)} />
            <Field label="Markdown Content" name="contentMarkdown" value={lessonForm.contentMarkdown} onChange={handleChange(setLessonForm)} textarea rows={4} />
            <Field label="Objectives" name="objectives" value={lessonForm.objectives} onChange={handleChange(setLessonForm)} help="Comma separated" />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-2">
              <Layers size={16} /> Create Lesson
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <Video size={20} className="text-accent" />
            <div>
              <h2 className="text-xl font-semibold text-white">Add Lesson Video</h2>
              <p className="text-sm text-gray-400">Attach a media lesson to an existing track lesson.</p>
            </div>
          </div>

          <form onSubmit={addVideo} className="space-y-4">
            <SelectField
              label="Track"
              value={selectedTrackId}
              onChange={(event) => setSelectedTrackId(event.target.value)}
              options={tracks.map((track) => ({ value: track.id, label: track.name }))}
            />
            <SelectField
              label="Lesson"
              value={selectedLessonId}
              onChange={(event) => setSelectedLessonId(event.target.value)}
              options={lessons.map((lesson: any) => ({ value: lesson.id, label: lesson.title || lesson.slug || lesson.id }))}
            />
            <Field label="Title" name="title" value={videoForm.title} onChange={handleChange(setVideoForm)} />
            <Field label="URL" name="url" value={videoForm.url} onChange={handleChange(setVideoForm)} />
            <Field label="Description" name="description" value={videoForm.description} onChange={handleChange(setVideoForm)} textarea />
            <Field label="Duration" name="durationMinutes" value={String(videoForm.durationMinutes)} onChange={handleChange(setVideoForm)} type="number" />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-2">
              <Video size={16} /> Add Video
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  textarea,
  rows = 3,
  type = 'text',
  help,
}: {
  label: string
  name: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  textarea?: boolean
  rows?: number
  type?: string
  help?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          rows={rows}
          onChange={onChange}
          className="w-full rounded-2xl border border-border bg-bg-secondary px-4 py-3 text-sm text-white outline-none transition focus:border-accent"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-border bg-bg-secondary px-4 py-3 text-sm text-white outline-none transition focus:border-accent"
        />
      )}
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-border bg-bg-secondary px-4 py-3 text-sm text-white outline-none transition focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-bg-secondary text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
