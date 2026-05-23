import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Pin, Search } from 'lucide-react'
import { notesApi } from '@/api/client'

const STATIC_NOTES = [
  { id: '1', title: 'Big-O Notation Cheatsheet', trackId: 'ml', content: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)\n\nBubble sort = O(n²)\nMerge sort = O(n log n)\nBinary search = O(log n)\n\n💡 Always aim for O(n log n) or better for large datasets!', backgroundColor: '#fef9c3', borderColor: '#fde68a', textColor: '#78350f', labelColor: '#92400e', isPinned: true, createdAt: '2024-01-10' },
  { id: '2', title: 'SQL JOIN Types', trackId: 'sql', content: 'INNER JOIN → only matching rows in both tables\n\nLEFT JOIN → all from left + matches from right\n(NULL if no match on right)\n\nRIGHT JOIN → opposite of LEFT\n\nFULL OUTER JOIN → everything from both tables\n\nCROSS JOIN → cartesian product ⚠️', backgroundColor: '#dcfce7', borderColor: '#bbf7d0', textColor: '#14532d', labelColor: '#15803d', isPinned: true, createdAt: '2024-01-12' },
  { id: '3', title: 'Python List Comprehension', trackId: 'python', content: '[x*2 for x in range(10)]\n[x for x in lst if x > 0]\n{k:v for k,v in d.items()}\n{x for x in lst}  # set comp\n\nnested:\n[i for row in matrix\n   for i in row]', backgroundColor: '#fef3c7', borderColor: '#fde68a', textColor: '#451a03', labelColor: '#b45309', isPinned: false, createdAt: '2024-01-14' },
  { id: '4', title: 'ML Algorithm Selection', trackId: 'ml', content: 'Tabular data → XGBoost / RF\nText → Transformers (BERT, GPT)\nImages → CNNs (ResNet)\nTime Series → LSTM / Prophet\n\n✅ Always start simple\n✅ Benchmark before tuning\n✅ Iterate up complexity', backgroundColor: '#ede9fe', borderColor: '#ddd6fe', textColor: '#3b0764', labelColor: '#6d28d9', isPinned: true, createdAt: '2024-01-16' },
  { id: '5', title: 'Docker Quick Commands', trackId: 'cloud', content: 'docker build -t app .\ndocker run -p 8080:80 app\ndocker-compose up -d\ndocker ps\ndocker stop [id]\ndocker logs -f [id]\ndocker exec -it [id] bash\ndocker system prune -a', backgroundColor: '#dbeafe', borderColor: '#bfdbfe', textColor: '#1e3a5f', labelColor: '#1d4ed8', isPinned: false, createdAt: '2024-01-18' },
  { id: '6', title: 'Transformer Architecture', trackId: 'llm', content: 'Attention(Q,K,V) = softmax(QKᵀ/√d)V\n\nMulti-head = parallel attention\nPositional encoding = sequence order\nFeed-forward after each attention\nLayer norm + residual connections\n\n🔑 "Attention is All You Need" (2017)', backgroundColor: '#fce7f3', borderColor: '#fbcfe8', textColor: '#500724', labelColor: '#be185d', isPinned: true, createdAt: '2024-01-20' },
  { id: '7', title: 'Pandas Cheatsheet', trackId: 'data-analysis', content: 'df.head() / df.tail()\ndf.info() → dtypes & nulls\ndf.describe() → stats\ndf.groupby(col).agg(fn)\ndf.merge(df2, on=col)\ndf[df[col] > val] → filter\ndf.pivot_table()\ndf.to_csv("file.csv")', backgroundColor: '#fff7ed', borderColor: '#fed7aa', textColor: '#431407', labelColor: '#c2410c', isPinned: false, createdAt: '2024-01-22' },
  { id: '8', title: 'Spring Boot Annotations', trackId: 'java', content: '@RestController → HTTP controller\n@Service → business logic\n@Repository → data access\n@Autowired → inject dependency\n@Transactional → DB transactions\n@GetMapping @PostMapping\n@Value → inject properties\n@Scheduled → cron jobs', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#052e16', labelColor: '#15803d', isPinned: false, createdAt: '2024-01-24' },
  { id: '9', title: 'NLP Pipeline Steps', trackId: 'nlp', content: '1. Raw Text → Tokenize\n2. Lowercase + normalize\n3. Remove stopwords & punct\n4. Stemming / Lemmatization\n5. Feature extraction\n   TF-IDF or Embeddings\n6. Model training\n7. Evaluate & post-process', backgroundColor: '#fdf4ff', borderColor: '#f0abfc', textColor: '#3b0764', labelColor: '#7e22ce', isPinned: false, createdAt: '2024-01-26' },
]

const TAPE_COLORS: Record<string, string> = {
  '#fef9c3': '#fde68a',
  '#dcfce7': '#bbf7d0',
  '#fef3c7': '#fde68a',
  '#ede9fe': '#ddd6fe',
  '#dbeafe': '#bfdbfe',
  '#fce7f3': '#fbcfe8',
  '#fff7ed': '#fed7aa',
  '#f0fdf4': '#bbf7d0',
  '#fdf4ff': '#f0abfc',
}

const TRACKS = ['All', 'python', 'sql', 'ml', 'java', 'cloud', 'nlp', 'llm', 'data-analysis']

export function NotesPage() {
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('All')

  const { data } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesApi.getNotes(),
  })

  const notes = data?.data?.data || STATIC_NOTES

  const filtered = notes.filter((n: any) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchTrack = trackFilter === 'All' || n.trackId === trackFilter
    return matchSearch && matchTrack
  })

  const pinned = filtered.filter((n: any) => n.isPinned)
  const unpinned = filtered.filter((n: any) => !n.isPinned)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Handwritten Notes</h1>
          <p className="text-gray-400 text-sm">Curated cheatsheets and study notes. Print, save or reference anytime.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#6366f1)' }}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TRACKS.map((t) => (
            <button key={t} onClick={() => setTrackFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                trackFilter === t ? 'bg-accent text-white' : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}>
              {t === 'All' ? 'All' : t === 'data-analysis' ? 'Data' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <Pin size={15} className="text-amber-400" /> Pinned
          </div>
          <div className="grid grid-cols-3 gap-5">
            {pinned.map((note: any) => <NoteCard key={note.id} note={note} />)}
          </div>
        </div>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-white mb-4">All Notes</div>
          <div className="grid grid-cols-3 gap-5">
            {unpinned.map((note: any) => <NoteCard key={note.id} note={note} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">No notes match your search.</div>
      )}
    </div>
  )
}

function NoteCard({ note }: { note: any }) {
  const tapeColor = TAPE_COLORS[note.backgroundColor] || note.borderColor

  return (
    <div className="note-card" style={{
      background: `linear-gradient(135deg, ${note.backgroundColor}, ${note.backgroundColor}dd)`,
      border: `1px solid ${note.borderColor}`,
    }}>
      <div className="note-tape" style={{ background: tapeColor }} />
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-bold flex items-center gap-1.5 pt-2"
          style={{ color: note.labelColor }}>
          ✏️ {note.title}
        </div>
        {note.isPinned && <Pin size={13} style={{ color: note.labelColor }} className="flex-shrink-0 mt-2" />}
      </div>
      <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{ color: note.textColor }}>
        {note.content}
      </pre>
      <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: note.borderColor }}>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${note.borderColor}80`, color: note.labelColor }}>
          {note.trackId}
        </span>
        <span className="text-xs" style={{ color: note.labelColor + '80' }}>
          {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
