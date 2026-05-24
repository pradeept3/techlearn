import { useState } from 'react'
import { CodeEditor } from '@/components/chat/CodeEditor'
import { BookOpen } from 'lucide-react'

type Language = 'python' | 'sql' | 'java' | 'javascript' | 'bash'

interface Snippet {
  id: string; title: string; language: Language; description: string; code: string; output: string
}

const LANGUAGES: { id: Language; label: string; emoji: string }[] = [
  { id: 'python',     label: 'Python',     emoji: '🐍' },
  { id: 'sql',        label: 'SQL',        emoji: '🗄️' },
  { id: 'java',       label: 'Java',       emoji: '☕' },
  { id: 'javascript', label: 'JavaScript', emoji: '⚡' },
  { id: 'bash',       label: 'Bash',       emoji: '🖥️' },
]

const STARTER_CODE: Record<Language, { code: string; output: string }> = {
  python: {
    code: `# Python Playground 🐍\ndef fibonacci(n):\n    """Generate Fibonacci sequence up to n terms."""\n    a, b = 0, 1\n    sequence = []\n    for _ in range(n):\n        sequence.append(a)\n        a, b = b, a + b\n    return sequence\n\nresult = fibonacci(10)\nprint(f"Fibonacci(10): {result}")\nprint(f"Sum: {sum(result)}")\nprint(f"Max: {max(result)}")`,
    output: 'Fibonacci(10): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\nSum: 88\nMax: 34',
  },
  sql: {
    code: `-- SQL Playground 🗄️\n-- Sample tables: users, orders, products\n\nSELECT\n    u.name,\n    COUNT(o.order_id)     AS total_orders,\n    SUM(o.amount)         AS total_spent,\n    AVG(o.amount)         AS avg_order\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY total_spent DESC;`,
    output: 'name          | total_orders | total_spent | avg_order\nAlice Johnson | 2            | 1028        | 514.0\nSara Williams | 1            | 79          | 79.0\nBob Chen      | 1            | 349         | 349.0\nDavid Lee     | 1            | 199         | 199.0',
  },
  java: {
    code: `// Java Playground ☕\nimport java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Stream API example\n        List<Integer> numbers = List.of(1,2,3,4,5,6,7,8,9,10);\n\n        int sumOfSquaresOfEvens = numbers.stream()\n            .filter(n -> n % 2 == 0)\n            .mapToInt(n -> n * n)\n            .sum();\n\n        System.out.println("Sum of squares of evens: " + sumOfSquaresOfEvens);\n\n        // Collectors\n        Map<Boolean, List<Integer>> partitioned = numbers.stream()\n            .collect(Collectors.partitioningBy(n -> n % 2 == 0));\n        System.out.println("Even: " + partitioned.get(true));\n        System.out.println("Odd: " + partitioned.get(false));\n    }\n}`,
    output: 'Sum of squares of evens: 220\nEven: [2, 4, 6, 8, 10]\nOdd: [1, 3, 5, 7, 9]',
  },
  javascript: {
    code: `// JavaScript Playground ⚡\n// Async/await with error handling\nconst fetchUserData = async (userId) => {\n  try {\n    // Simulating API call\n    const response = await new Promise((resolve) =>\n      setTimeout(() => resolve({ id: userId, name: 'Alice', role: 'admin' }), 500)\n    );\n    return response;\n  } catch (error) {\n    console.error('Error:', error.message);\n  }\n};\n\n// Array methods chaining\nconst data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];\nconst result = [...new Set(data)]\n  .sort((a, b) => a - b)\n  .filter(n => n > 2)\n  .map(n => n ** 2);\n\nconsole.log('Unique sorted squares > 4:', result);\nfetchUserData(42).then(u => console.log('User:', JSON.stringify(u)));`,
    output: 'Unique sorted squares > 4: [9, 16, 25, 36, 81]\nUser: {"id":42,"name":"Alice","role":"admin"}',
  },
  bash: {
    code: `#!/bin/bash\n# Bash Playground 🖥️\n# Simulate a deployment script\n\necho "=== TechLearn Deploy Script ==="\necho ""\n\n# Simulate build steps\nsteps=("Installing dependencies" "Running tests" "Building Docker image" "Pushing to registry" "Deploying to ECS")\n\nfor step in "\${steps[@]}"; do\n    echo -n "⏳ $step..."\n    sleep 0.1  # simulate work\n    echo " ✓"\ndone\n\necho ""\necho "✅ Deployment complete!"\necho "🌐 App running at: https://techlearn.yourdomain.com"`,
    output: '=== TechLearn Deploy Script ===\n\n⏳ Installing dependencies... ✓\n⏳ Running tests... ✓\n⏳ Building Docker image... ✓\n⏳ Pushing to registry... ✓\n⏳ Deploying to ECS... ✓\n\n✅ Deployment complete!\n🌐 App running at: https://techlearn.yourdomain.com',
  },
}

const SNIPPET_LIBRARY: Snippet[] = [
  { id: 's1', title: 'Fibonacci Generator', language: 'python', description: 'Efficient generator using yield', code: `def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ng = fib()\nprint([next(g) for _ in range(10)])`, output: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]' },
  { id: 's2', title: 'Window Functions', language: 'sql', description: 'RANK and running totals', code: `SELECT name, total_spent,\n  RANK() OVER (ORDER BY total_spent DESC) as rank,\n  SUM(total_spent) OVER () as grand_total\nFROM users;`, output: 'name  | total_spent | rank | grand_total\nAlice | 4230        | 1    | 11040' },
  { id: 's3', title: 'Stream API', language: 'java', description: 'Java 8+ functional pipelines', code: `List.of(1,2,3,4,5)\n    .stream()\n    .filter(n -> n % 2 == 0)\n    .map(n -> n * n)\n    .forEach(System.out::println);`, output: '4\n16' },
  { id: 's4', title: 'Async/Await', language: 'javascript', description: 'Modern async patterns', code: `const delay = ms => new Promise(r => setTimeout(r, ms));\n\nasync function run() {\n  await delay(100);\n  return { status: 'done' };\n}\n\nrun().then(console.log);`, output: '{ status: \'done\' }' },
  { id: 's5', title: 'List Comprehension', language: 'python', description: 'Pythonic data transforms', code: `matrix = [[1,2,3],[4,5,6],[7,8,9]]\nflat = [x for row in matrix for x in row]\nprint(flat)\nprint([x**2 for x in flat if x % 2 != 0])`, output: '[1, 2, 3, 4, 5, 6, 7, 8, 9]\n[1, 9, 25, 49, 81]' },
  { id: 's6', title: 'Docker Build & Push', language: 'bash', description: 'Build, tag, and push an image', code: `IMAGE="myapp"\nTAG=$(git rev-parse --short HEAD)\n\ndocker build -t $IMAGE:$TAG .\ndocker tag $IMAGE:$TAG registry/$IMAGE:latest\ndocker push registry/$IMAGE:$TAG\necho "Pushed $IMAGE:$TAG"`, output: 'Building... ✓\nTagging... ✓\nPushing... ✓\nPushed myapp:a3f1c2b' },
]

export function PlaygroundPage() {
  const [activeLang, setActiveLang] = useState<Language>('python')
  const [code, setCode] = useState(STARTER_CODE['python'].code)

  const handleLangSwitch = (lang: Language) => {
    setActiveLang(lang)
    setCode(STARTER_CODE[lang].code)
  }

  const loadSnippet = (snippet: Snippet) => {
    setActiveLang(snippet.language)
    setCode(snippet.code)
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Code Playground</h1>
        <p className="text-gray-400 text-sm">Write and run code for all technologies. Experiment freely — all code runs in a sandboxed environment.</p>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {LANGUAGES.map((lang) => (
          <button key={lang.id} onClick={() => handleLangSwitch(lang.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLang === lang.id
                ? 'text-white border border-accent'
                : 'bg-surface border border-border text-gray-400 hover:text-white'
            }`}
            style={activeLang === lang.id ? { background: 'rgba(79,142,247,0.15)' } : {}}>
            {lang.emoji} {lang.label}
          </button>
        ))}
      </div>

      {/* Main editor */}
      <CodeEditor
        key={activeLang}
        title={`${LANGUAGES.find((l) => l.id === activeLang)?.emoji} ${activeLang} — Live Playground`}
        language={activeLang}
        initialCode={code}
        expectedOutput={STARTER_CODE[activeLang].output}
        onCodeChange={setCode}
      />

      {/* Snippet library */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={17} className="text-accent" />
          <span className="text-base font-semibold text-white">Snippet Library</span>
          <span className="text-xs text-gray-500 ml-1">Click any snippet to load it in the editor</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SNIPPET_LIBRARY.map((snippet) => (
            <div key={snippet.id} onClick={() => loadSnippet(snippet)}
              className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:bg-surface-2 hover:border-border-2 hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {LANGUAGES.find((l) => l.id === snippet.language)?.emoji}
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {snippet.language}
                </span>
              </div>
              <div className="text-sm font-semibold text-white mb-1 group-hover:text-accent transition-colors">
                {snippet.title}
              </div>
              <div className="text-xs text-gray-500">{snippet.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
