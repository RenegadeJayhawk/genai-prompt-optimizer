import { useMemo, useState } from 'react'
import { Copy, Download, RotateCcw, Sparkles } from 'lucide-react'
import { copyTextToClipboard } from './clipboard.js'

const templates = {
  general: 'You are an expert assistant. Help with the following task:',
  writing: 'Act as a senior editor. Create a clear, audience-appropriate draft for:',
  analysis: 'Act as a rigorous analyst. Examine the following and provide assumptions, findings, and next steps:',
  code: 'Act as a senior software engineer. Propose a secure, maintainable solution for:',
}

function optimizePrompt(prompt, template) {
  const task = prompt.trim() || '[Describe the task]'
  return `${templates[template]}

${task}

Requirements:
- Ask one concise clarifying question only if critical information is missing.
- State assumptions explicitly.
- Return a well-structured answer with actionable steps.
- Use concise, precise language and verify factual claims when sources are available.

Output format:
1. Summary
2. Recommended approach
3. Detailed response
4. Risks or open questions`
}

export default function PromptOptimizerApp() {
  const [prompt, setPrompt] = useState('Draft a launch plan for a new AI productivity tool aimed at independent consultants.')
  const [template, setTemplate] = useState('general')
  const [optimized, setOptimized] = useState(() => optimizePrompt(prompt, 'general'))
  const [copied, setCopied] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  const stats = useMemo(() => ({
    original: prompt.trim().split(/\s+/).filter(Boolean).length,
    optimized: optimized.trim().split(/\s+/).filter(Boolean).length,
  }), [prompt, optimized])

  const handleOptimize = () => {
    setOptimized(optimizePrompt(prompt, template))
    setCopied(false)
    setCopyMessage('')
  }

  const handleCopy = async () => {
    setCopied(false)
    setCopyMessage('')
    if (await copyTextToClipboard(optimized)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } else {
      setCopyMessage('Unable to copy automatically. Select the output and copy it manually.')
    }
  }

  const handleExport = () => {
    const blob = new Blob([optimized], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'optimized-prompt.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand"><Sparkles size={22} /> GenAI Prompt Optimizer</div>
        <p>Turn a rough request into a clear, reusable prompt in seconds.</p>
      </header>

      <section className="workspace" aria-label="Prompt optimization workspace">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INPUT</span>
              <h1>Start with your idea</h1>
            </div>
            <span className="word-count">{stats.original} words</span>
          </div>
          <label htmlFor="template">Optimization mode</label>
          <select id="template" value={template} onChange={(event) => setTemplate(event.target.value)}>
            <option value="general">General purpose</option>
            <option value="writing">Writing & content</option>
            <option value="analysis">Analysis & research</option>
            <option value="code">Software & code</option>
          </select>
          <label htmlFor="prompt">Your prompt</label>
          <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the result you need…" />
          <div className="actions">
            <button className="secondary" onClick={() => setPrompt('') }><RotateCcw size={16} /> Clear</button>
            <button className="primary" onClick={handleOptimize}><Sparkles size={16} /> Optimize prompt</button>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">OUTPUT</span>
              <h2>Ready to use</h2>
            </div>
            <span className="word-count">{stats.optimized} words</span>
          </div>
          <pre aria-label="Optimized prompt">{optimized}</pre>
          <div className="actions">
            <button className="secondary" onClick={handleCopy}><Copy size={16} /> {copied ? 'Copied' : 'Copy'}</button>
            <button className="primary" onClick={handleExport}><Download size={16} /> Export .txt</button>
          </div>
          {copyMessage && <p role="status" aria-live="polite">{copyMessage}</p>}
        </div>
      </section>

      <footer>Local-first optimizer · No prompt data is sent from this page.</footer>
    </main>
  )
}
