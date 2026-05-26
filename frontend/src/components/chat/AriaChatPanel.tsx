import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { X, Send, RefreshCw, Bot, User, ExternalLink, Loader2 } from 'lucide-react'
import { useChatStore } from '@/store/uiStore'
import { useUIStore } from '@/store/uiStore'
import { chatApi } from '@/api/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import type { ChatMessage, RAGSource } from '@/types'

const QUICK_PROMPTS = [
  'Explain Python decorators',
  'What is gradient descent?',
  'SQL JOIN types with examples',
  'How does a transformer work?',
  'Explain Docker vs Kubernetes',
  'What is RAG in LLMs?',
]

export function AriaChatPanel() {
  const { toggleChat } = useUIStore()
  const { messages, isStreaming, addMessage, updateMessage, setStreaming, currentContext, resetSession } =
    useChatStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')

    // Add user message
    addMessage({ role: 'user', content: text })

    // Add empty assistant message (will stream into it)
    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    setStreaming(true)

    try {
      // Use streaming SSE endpoint
      const { sessionId } = useChatStore.getState()
      const url = new URL(`${import.meta.env.VITE_AI_SERVICE_URL || ''}/chat/stream`)
      url.searchParams.set('session_id', sessionId)
      url.searchParams.set('message', text)
      if (currentContext) url.searchParams.set('context', currentContext)

      const token = localStorage.getItem('techlearn-auth')
        ? JSON.parse(localStorage.getItem('techlearn-auth')!).state.token
        : null
      if (token) url.searchParams.set('token', token)

      const evtSource = new EventSource(url.toString())
      eventSourceRef.current = evtSource

      let accumulated = ''

      evtSource.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.type === 'delta') {
          accumulated += data.content
          updateMessage(assistantId, { content: accumulated, isStreaming: true })
        } else if (data.type === 'sources') {
          updateMessage(assistantId, { sources: data.sources })
        } else if (data.type === 'done') {
          updateMessage(assistantId, { content: accumulated, isStreaming: false })
          evtSource.close()
          setStreaming(false)
        } else if (data.type === 'error') {
          updateMessage(assistantId, {
            content: `❌ Error: ${data.message}`,
            isStreaming: false,
          })
          evtSource.close()
          setStreaming(false)
        }
      }

      evtSource.onerror = () => {
        evtSource.close()
        setStreaming(false)
        // Fallback to non-streaming
        chatApi
          .sendMessage(sessionId, text, currentContext ?? undefined)
          .then(({ data }) => {
            updateMessage(assistantId, {
              content: data.response,
              sources: data.sources,
              isStreaming: false,
            })
          })
          .catch(() => {
            updateMessage(assistantId, {
              content: "I'm having trouble connecting right now. Please try again.",
              isStreaming: false,
            })
          })
      }
    } catch (err) {
      setStreaming(false)
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleReset = () => {
    eventSourceRef.current?.close()
    setStreaming(false)
    resetSession()
  }

  return (
    <div className="fixed bottom-0 right-6 w-96 h-[600px] flex flex-col bg-bg-secondary border border-border rounded-t-2xl shadow-2xl z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)' }}>
          🤖
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Aria — AI Tutor</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            RAG-powered · Always learning
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-all"
            title="New conversation"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={toggleChat}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-all"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role === 'user' && (
          <TypingIndicator />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setInput(p); setTimeout(sendMessage, 50) }}
              className="text-xs px-2.5 py-1.5 bg-surface border border-border rounded-full text-gray-400 hover:text-white hover:border-accent transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aria anything… (Shift+Enter for newline)"
          rows={1}
          className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent resize-none transition-all"
          style={{ maxHeight: '100px', overflowY: 'auto' }}
          disabled={isStreaming}
        />
        <button
          onClick={sendMessage}
          disabled={isStreaming || !input.trim()}
          className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}
        >
          {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div className="flex items-start gap-2">
        {!isUser && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)' }}>
            <Bot size={14} />
          </div>
        )}
        <div
          className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'text-white rounded-br-sm'
              : 'bg-surface text-white rounded-bl-sm border border-border'
          }`}
          style={isUser ? { background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' } : {}}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ children }) {
                  return (
                    <code className="bg-bg-primary text-accent px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  )
                },
                pre({ children }) {
                  return (
                    <pre className="bg-bg-primary rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono border border-border">
                      {children}
                    </pre>
                  )
                },
              }}
            >
              {message.content || (message.isStreaming ? '▋' : '')}
            </ReactMarkdown>
          )}
        </div>
        {isUser && (
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* RAG Sources */}
      {message.sources && message.sources.length > 0 && (
        <RAGSources sources={message.sources} />
      )}
    </div>
  )
}

function RAGSources({ sources }: { sources: RAGSource[] }) {
  return (
    <div className="ml-8 mt-1">
      <div className="text-xs text-gray-500 mb-1">📚 Sources from course content:</div>
      <div className="flex flex-col gap-1">
        {sources.slice(0, 3).map((src, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-surface border border-border rounded-lg px-2 py-1">
            <span className="text-green-400 font-mono">{Math.round(src.relevanceScore * 100)}%</span>
            <span className="text-gray-400 truncate">{src.lessonTitle}</span>
            <ExternalLink size={10} className="text-gray-500 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-surface">
        <Bot size={14} />
      </div>
      <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
