import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Code2, HelpCircle, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { coursesApi, progressApi } from '@/api/client'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { useChatStore } from '@/store/uiStore'
import { useUIStore } from '@/store/uiStore'
import toast from 'react-hot-toast'

type Tab = 'lesson' | 'code' | 'quiz'

const DEMO_LESSON = {
  id: 'l4', trackId: 'python', title: 'Functions & Lambda Expressions', slug: 'functions', order: 4,
  type: 'text', durationMinutes: 25, completed: false,
  contentMarkdown: `## What is a Function?\n\nA function is a reusable block of code that performs a specific task. In Python, functions are **first-class objects** — they can be stored in variables, passed as arguments, and returned from other functions.\n\n## Defining Functions\n\n\`\`\`python\ndef greet(name: str, greeting: str = "Hello") -> str:\n    """Return a personalized greeting."""\n    return f"{greeting}, {name}!"\n\nprint(greet("Alice"))         # Hello, Alice!\nprint(greet("Bob", "Hi"))    # Hi, Bob!\n\`\`\`\n\n## *args and **kwargs\n\n\`\`\`python\ndef summarize(*args, **kwargs):\n    print(f"Args: {args}")       # positional\n    print(f"Kwargs: {kwargs}")   # keyword\n\nsummarize(1, 2, 3, name="Alice", age=30)\n\`\`\`\n\n## Lambda Functions\n\nLambda functions are anonymous single-expression functions:\n\n\`\`\`python\n# Regular function\ndef square(x):\n    return x ** 2\n\n# Equivalent lambda\nsquare = lambda x: x ** 2\n\n# Common use: sorting\nstudents = [("Alice", 92), ("Bob", 85), ("Carol", 97)]\nstudents.sort(key=lambda s: s[1], reverse=True)\nprint(students)  # [("Carol", 97), ("Alice", 92), ("Bob", 85)]\n\`\`\`\n\n## Higher-Order Functions\n\n\`\`\`python\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\n# map — transform each element\nsquares = list(map(lambda x: x**2, numbers))\n\n# filter — keep matching elements  \nevens = list(filter(lambda x: x % 2 == 0, numbers))\n\n# reduce — fold to single value\nfrom functools import reduce\ntotal = reduce(lambda acc, x: acc + x, numbers)  # 55\n\`\`\`\n\n## 💡 Best Practices\n\n- Use descriptive names for regular functions, lambdas for simple transforms\n- Add type hints for better IDE support and documentation\n- Keep functions small and focused (single responsibility)\n- Prefer list comprehensions over map/filter when readability matters`,
  summary: 'Learn Python functions, default args, *args/**kwargs, lambda, and higher-order functions.',
  objectives: ['Write functions with default and keyword arguments', 'Use *args and **kwargs for flexible interfaces', 'Apply lambda for inline transforms', 'Use map, filter, and reduce effectively'],
  codeExamples: [{
    id: 'c1', title: 'Function Examples', language: 'python',
    code: `# Try editing this code!\ndef calculate_stats(numbers):\n    """Calculate basic statistics."""\n    if not numbers:\n        return None\n    return {\n        'count': len(numbers),\n        'mean':  sum(numbers) / len(numbers),\n        'max':   max(numbers),\n        'min':   min(numbers),\n        'range': max(numbers) - min(numbers)\n    }\n\n# Test it\ndata = [85, 92, 78, 96, 88, 74, 91]\nstats = calculate_stats(data)\nfor key, val in stats.items():\n    print(f"{key:>8}: {val:.2f}" if isinstance(val, float) else f"{key:>8}: {val}")`,
    expectedOutput: `   count: 7\n    mean: 86.29\n     max: 96\n     min: 74\n   range: 22`,
    explanation: 'A practical function that calculates statistics for a list of numbers.',
  }],
  quiz: {
    questions: [
      { id: 'q1', question: 'What does *args collect in a function definition?', options: ['Keyword arguments as a dict', 'Positional arguments as a tuple', 'All arguments as a list', 'Default values only'], correctIndex: 1, explanation: '*args collects extra positional arguments into a tuple.' },
      { id: 'q2', question: 'Which is equivalent to: lambda x: x * 2?', options: ['def f(x): x * 2', 'def f(x): return x * 2', 'function(x) { return x * 2 }', 'f = x => x * 2'], correctIndex: 1, explanation: 'A lambda is equivalent to a one-line function with an implicit return.' },
      { id: 'q3', question: 'What does filter() return in Python 3?', options: ['A list', 'A set', 'An iterator object', 'A tuple'], correctIndex: 2, explanation: 'In Python 3, filter() returns a lazy iterator. Wrap with list() to get a list.' },
    ],
    passingScore: 70,
  },
}

export function LessonPage() {
  const { trackId, lessonId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('lesson')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const { setContext } = useChatStore()
  const { setChatOpen } = useUIStore()

  const { data, isLoading } = useQuery({
    queryKey: ['lesson', trackId, lessonId],
    queryFn: () => coursesApi.getLesson(trackId!, lessonId!),
    enabled: !!trackId && !!lessonId,
  })

  const lesson = data?.data?.data || DEMO_LESSON

  // Set lesson context for AI tutor
  useState(() => {
    setContext(`${lesson.title}: ${lesson.summary}`)
  })

  const completeMutation = useMutation({
    mutationFn: () => progressApi.getStreak(), // placeholder — real: progressApi.completeLesson(lessonId!)
    onSuccess: (res: any) => {
      const d = res?.data?.data
      toast.success(`🎉 Lesson complete! +${d?.xpGained ?? 50} XP earned!`)
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      navigate(`/tracks/${trackId}`)
    },
  })

  const handleQuizSubmit = () => {
    const correct = lesson.quiz!.questions.filter(
      (q: any) => quizAnswers[q.id] === q.correctIndex
    ).length
    const score = Math.round((correct / lesson.quiz!.questions.length) * 100)
    setQuizSubmitted(true)
    if (score >= lesson.quiz!.passingScore) {
      toast.success(`Quiz passed! Score: ${score}% ✓`)
    } else {
      toast.error(`Score: ${score}%. Need ${lesson.quiz!.passingScore}% to pass. Try again!`)
    }
  }

  const TABS = [
    { id: 'lesson' as Tab, label: 'Lesson', icon: BookOpen },
    { id: 'code'   as Tab, label: 'Code',   icon: Code2 },
    { id: 'quiz'   as Tab, label: 'Quiz',   icon: HelpCircle },
  ]

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-accent" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <button onClick={() => navigate(`/tracks/${trackId}`)}
          className="flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeft size={15} /> Back to track
        </button>
        <span>/</span>
        <span className="text-white">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
        <p className="text-gray-400 text-sm">{lesson.summary}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {lesson.objectives?.map((obj: string) => (
            <span key={obj} className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-gray-400">
              ✓ {obj}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-5 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-surface-2 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'lesson' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-8">
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const lang = (className || '').replace('language-', '')
                  const code = String(children).replace(/\n$/, '')
                  if (lang) {
                    return <CodeEditor language={lang || 'python'} initialCode={code} readOnly />
                  }
                  return <code className="bg-surface text-accent px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                },
              }}>
              {lesson.contentMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-4">
          {lesson.codeExamples?.map((ex: any) => (
            <div key={ex.id}>
              <div className="text-sm text-gray-400 mb-2">{ex.explanation}</div>
              <CodeEditor
                title={ex.title}
                language={ex.language}
                initialCode={ex.code}
                expectedOutput={ex.expectedOutput}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && lesson.quiz && (
        <div className="space-y-5">
          {lesson.quiz.questions.map((q: any, qi: number) => (
            <div key={q.id} className="bg-bg-secondary border border-border rounded-xl p-5">
              <div className="text-sm font-semibold text-white mb-4">
                {qi + 1}. {q.question}
              </div>
              <div className="space-y-2">
                {q.options.map((opt: string, i: number) => {
                  const selected = quizAnswers[q.id] === i
                  const isCorrect = i === q.correctIndex
                  let cls = 'border border-border text-gray-300 hover:border-border-2'
                  if (quizSubmitted) {
                    if (isCorrect) cls = 'border border-green-500 bg-green-500/10 text-green-300'
                    else if (selected) cls = 'border border-red-500 bg-red-500/10 text-red-300'
                  } else if (selected) {
                    cls = 'border border-accent bg-accent/10 text-white'
                  }
                  return (
                    <button key={i} disabled={quizSubmitted}
                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: i }))}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${cls} bg-surface`}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  )
                })}
              </div>
              {quizSubmitted && (
                <div className="mt-3 text-xs text-gray-400 bg-surface rounded-lg px-3 py-2">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < lesson.quiz.questions.length}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
              Submit Quiz
            </button>
          ) : (
            <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-surface border border-border text-white hover:bg-surface-2 transition-all">
              Retry Quiz
            </button>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <button
          onClick={() => { setChatOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm text-gray-400 hover:text-white transition-all">
          🤖 Ask Aria about this lesson
        </button>
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          {completeMutation.isPending
            ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
            : <><CheckCircle size={15} /> Mark Complete</>}
        </button>
      </div>
    </div>
  )
}
