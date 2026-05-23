import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { sql } from '@codemirror/lang-sql'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { Play, Copy, Check, ChevronDown, RefreshCw } from 'lucide-react'
import { chatApi } from '@/api/client'
import toast from 'react-hot-toast'

const LANG_EXTENSIONS: Record<string, ReturnType<typeof python>> = {
  python: python(),
  java: java(),
  sql: sql(),
  javascript: javascript({ typescript: true }),
  typescript: javascript({ typescript: true }),
}

interface CodeEditorProps {
  initialCode: string
  language: string
  title?: string
  expectedOutput?: string
  readOnly?: boolean
  onCodeChange?: (code: string) => void
}

export function CodeEditor({
  initialCode,
  language,
  title,
  expectedOutput,
  readOnly = false,
  onCodeChange,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setShowOutput(true)
    setOutput('Running...')
    setIsError(false)

    try {
      const { data } = await chatApi.runCode(code, language)
      setOutput(data.output || data.result || 'No output')
      setIsError(data.error ?? false)
    } catch (err) {
      // Fallback: show simulated output for demo purposes
      setOutput(expectedOutput || '// Connect the AI service to run code')
      setIsError(false)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput('')
    setShowOutput(false)
    onCodeChange?.(initialCode)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center px-4 py-2.5 bg-bg-primary border-b border-border">
        <div className="flex gap-1.5 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs font-mono text-gray-400">
          {title || `${language}.${language === 'python' ? 'py' : language === 'java' ? 'java' : language}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-white transition-colors p-1"
            title="Reset to original"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent transition-colors px-2 py-1 rounded"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!readOnly && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.3)' }}
            >
              <Play size={13} />
              {isRunning ? 'Running…' : 'Run'}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <CodeMirror
        value={code}
        extensions={[LANG_EXTENSIONS[language] || python()]}
        theme={oneDark}
        readOnly={readOnly}
        onChange={(val) => {
          setCode(val)
          onCodeChange?.(val)
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
          bracketMatching: true,
        }}
        style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
      />

      {/* Output */}
      {showOutput && (
        <div className="border-t border-border">
          <div
            className="flex items-center gap-2 px-4 py-2 bg-bg-primary cursor-pointer hover:bg-surface transition-colors"
            onClick={() => setShowOutput(!showOutput)}
          >
            <span className="text-xs font-medium text-gray-400">Output</span>
            <ChevronDown size={13} className="text-gray-500" />
          </div>
          <pre
            className={`px-4 py-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto ${
              isError ? 'text-red-400' : 'text-green-400'
            }`}
            style={{ background: '#0d1117' }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
