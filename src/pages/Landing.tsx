import { Link } from 'react-router-dom'
import { ArrowRight, Upload, FileUser, Briefcase, Mic2, Search, Sparkles, TrendingUp, ShieldCheck, Layers, Zap, MonitorSmartphone } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Bits'
import { ThemeToggle } from '@/components/layout/AppShell'

const STEPS = [
  { n: '01', t: 'Upload your resume', d: 'PDF, DOCX or TXT becomes a structured Candidate Knowledge Base you can review and edit.', i: FileUser },
  { n: '02', t: 'Add the job', d: 'Paste the description or a public URL. We extract requirements, keywords and likely questions.', i: Briefcase },
  { n: '03', t: 'Practice', d: 'Mock interviews with an AI interviewer: behavioral, technical, HR, hiring manager, English.', i: Mic2 },
  { n: '04', t: 'Analyze the interview', d: 'Each question is classified: intent, what is being evaluated, and which experience to use.', i: Search },
  { n: '05', t: 'Improve your answers', d: 'Quick, natural and strong versions. Shorter, more confident, STAR — one click.', i: Sparkles },
  { n: '06', t: 'Track your progress', d: 'Scores, strongest skills, skills to improve and interview readiness over time.', i: TrendingUp },
]

const PILLARS = ['Resume Intelligence', 'Job Intelligence', 'Interview Intelligence', 'Real-time Context', 'Personalized Answers', 'Interview Practice']

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Link to="/app"><Button variant="secondary" size="sm">Open app</Button></Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted animate-fade-up"><Sparkles className="size-3.5 text-accent" /> AI Interview Strategist — not a chatbot</div>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] animate-fade-up">BE PREPARED FOR<br className="hidden md:block" /> EVERY QUESTION.</h1>
        <p className="mt-5 text-lg text-muted max-w-2xl mx-auto animate-fade-up">Your AI-powered interview strategist for remote and global careers.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up">
          <Link to="/app"><Button size="lg" icon={<ArrowRight className="size-4" />}>Start Preparing</Button></Link>
          <Link to="/app/resume"><Button size="lg" variant="secondary" icon={<Upload className="size-4" />}>Upload Your Resume</Button></Link>
        </div>
        <div className="mt-14 mx-auto max-w-4xl card p-2 shadow-lift animate-pop">
          <div className="rounded-xl bg-bg-2 border border-line p-5 text-left grid md:grid-cols-[1fr_1.2fr] gap-4">
            <div className="space-y-3">
              <div className="label-caps">Your personal AI interview copilot</div>
              {['WHO YOU ARE', 'WHAT THE COMPANY WANTS', 'WHAT THE INTERVIEWER IS ASKING', 'HOW YOU SHOULD ANSWER'].map((t, i) => (
                <div key={t} className="flex items-center gap-3"><span className="size-6 rounded-lg bg-accent-soft text-accent-ink text-[11px] font-bold flex items-center justify-center">{i + 1}</span><span className="text-sm font-semibold tracking-wide">{t}</span></div>
              ))}
            </div>
            <div className="rounded-xl bg-surface border border-line p-4 text-sm space-y-3">
              <div><div className="label-caps">Question</div><div className="font-semibold">"How do you deal with repetitive tasks?"</div></div>
              <div><div className="label-caps">Interviewer is evaluating</div><div className="flex flex-wrap gap-1 mt-1">{['Attention to detail', 'Consistency', 'Motivation', 'Quality control'].map((x) => <span key={x} className="rounded-md bg-violet-soft text-violet px-2 py-0.5 text-[11px] font-semibold">{x}</span>)}</div></div>
              <div><div className="label-caps">Suggested answer</div><p className="text-ink-2 leading-relaxed">Built from your real experience: the right role, the right result, the right length — never invented.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="label-caps text-center mb-3">How it works</div>
        <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight">From resume to confident answers in six steps</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-5 hover:shadow-lift transition">
              <div className="flex items-center justify-between"><span className="font-mono text-xs text-muted">{s.n}</span><s.i className="size-4 text-accent" /></div>
              <div className="mt-3 font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="card p-8 grid lg:grid-cols-3 gap-8">
          <div>
            <div className="label-caps mb-2">The difference</div>
            <h3 className="text-xl font-bold tracking-tight">A career strategist at your side</h3>
            <p className="text-sm text-muted mt-2">Every answer is based on the specific interview: your resume, the job, the company, the conversation so far — and it stays faithful to your real experience.</p>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {PILLARS.map((p) => <div key={p} className="rounded-xl bg-surface-2 border border-line px-4 py-3 text-sm font-semibold flex items-center gap-2"><Layers className="size-4 text-accent" />{p}</div>)}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-4">
        {[
          { i: Zap, t: 'Fast by design', d: 'Key points first, then the full answer streams in. Ultra-compact mode for a glance.' },
          { i: MonitorSmartphone, t: 'Separate Copilot window', d: 'Open the Copilot in its own window or display. It never embeds into your video call.' },
          { i: ShieldCheck, t: 'Private and honest', d: 'Data stays in your browser. Strict anti-hallucination rules: nothing about you is ever invented. Use in live interviews only where AI assistance is permitted.' },
        ].map((f) => (
          <div key={f.t} className="card p-5"><f.i className="size-5 text-accent" /><div className="mt-3 font-semibold">{f.t}</div><p className="text-sm text-muted mt-1">{f.d}</p></div>
        ))}
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-xs text-muted">InterviewPilot AI · Use the Copilot in real interviews only when AI assistance is allowed by the selection process.</footer>
    </div>
  )
}
