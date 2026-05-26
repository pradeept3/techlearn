import { create } from 'zustand'
import type { ChatMessage } from '@/types'

interface UIStore {
  sidebarOpen: boolean
  chatOpen: boolean
  activeTrackId: string | null
  searchQuery: string
  theme: 'dark' | 'light'

  setSidebarOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
  toggleChat: () => void
  setActiveTrack: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  chatOpen: false,
  activeTrackId: null,
  searchQuery: '',
  theme: 'dark',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setActiveTrack: (id) => set({ activeTrackId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setTheme: (theme) => set({ theme }),
}))

// ─── Chat Store ───────────────────────────────────────────────────────────────
interface ChatStore {
  sessionId: string
  messages: ChatMessage[]
  isStreaming: boolean
  currentContext: string | null // current lesson context for RAG

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setStreaming: (streaming: boolean) => void
  setContext: (ctx: string | null) => void
  clearMessages: () => void
  resetSession: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  sessionId: crypto.randomUUID(),
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm **Aria**, your AI tutor powered by RAG over TechLearn's full course library. Ask me to explain any concept, debug code, or quiz you on any topic!",
      timestamp: new Date().toISOString(),
    },
  ],
  isStreaming: false,
  currentContext: null,

  addMessage: (msg) => {
    const id = crypto.randomUUID()
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id, timestamp: new Date().toISOString() },
      ],
    }))
    return id
  },

  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setContext: (ctx) => set({ currentContext: ctx }),
  clearMessages: () => set({ messages: [] }),
  resetSession: () => set({ sessionId: crypto.randomUUID(), messages: [] }),
}))
