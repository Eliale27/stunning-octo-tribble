import { useEffect, useMemo } from 'react'
import { useStore, selectActiveJob, selectActiveResume } from '@/store/useStore'
import { getEngine, turnsToMemory, type InterviewContext } from '@/lib/ai'
import type { Interview, MockSession } from '@/lib/types'

export function useEngine() {
  const settings = useStore((s) => s.settings)
  return useMemo(() => getEngine(settings), [settings])
}

export function useTheme() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    const apply = () => {
      const resolved = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      try { localStorage.setItem('ip-theme', theme) } catch { /* ignore */ }
    }
    apply()
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

/** Builds the InterviewContext for an interview or mock session from the store. */
export function useInterviewContext(session?: Pick<Interview, 'jobId' | 'resumeId' | 'companyId' | 'turns'> | Pick<MockSession, 'jobId' | 'resumeId' | 'companyId'>): InterviewContext {
  const resumes = useStore((s) => s.resumes)
  const jobs = useStore((s) => s.jobs)
  const companies = useStore((s) => s.companies)
  const profile = useStore((s) => s.profile)
  const activeResume = useStore(selectActiveResume)
  const activeJob = useStore(selectActiveJob)
  return useMemo(() => {
    const resume = (session?.resumeId && resumes.find((r) => r.id === session.resumeId)) || activeResume
    const job = (session?.jobId && jobs.find((j) => j.id === session.jobId)) || activeJob
    const company = (session?.companyId && companies.find((c) => c.id === session.companyId)) || (job && companies.find((c) => c.name.toLowerCase() === job.company.toLowerCase()))
    const turns = session && 'turns' in session ? session.turns : []
    return { kb: resume?.kb, job: job?.analysis, company: company || undefined, profile, memory: turnsToMemory(turns) }
  }, [session, resumes, jobs, companies, profile, activeResume, activeJob])
}
