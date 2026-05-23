import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AriaChatPanel } from '@/components/chat/AriaChatPanel'
import { useUIStore } from '@/store/uiStore'

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const chatOpen = useUIStore((s) => s.chatOpen)

  return (
    <div className="flex h-screen bg-bg-primary text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '260px' : '0' }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Panel */}
      {chatOpen && <AriaChatPanel />}

      {/* AI Chat FAB */}
      {!chatOpen && <ChatFab />}
    </div>
  )
}

function ChatFab() {
  const toggleChat = useUIStore((s) => s.toggleChat)
  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"
      style={{
        background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
        boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
      }}
      title="Ask Aria (AI Tutor)"
    >
      🤖
    </button>
  )
}
