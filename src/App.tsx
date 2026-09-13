import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Toasts } from '@/components/ui/Toasts'
import { useTheme } from '@/lib/hooks'
import { Spinner } from '@/components/ui/Bits'

const Landing = lazy(() => import('@/pages/Landing'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Interviews = lazy(() => import('@/pages/Interviews'))
const InterviewDetail = lazy(() => import('@/pages/InterviewDetail'))
const CopilotWindow = lazy(() => import('@/pages/CopilotWindow'))
const MockInterviews = lazy(() => import('@/pages/MockInterviews'))
const MockSessionPage = lazy(() => import('@/pages/MockSession'))
const ResumePage = lazy(() => import('@/pages/Resume'))
const Jobs = lazy(() => import('@/pages/Jobs'))
const JobDetail = lazy(() => import('@/pages/JobDetail'))
const Challenges = lazy(() => import('@/pages/Challenges'))
const Performance = lazy(() => import('@/pages/Performance'))
const CompanyResearch = lazy(() => import('@/pages/CompanyResearch'))
const Settings = lazy(() => import('@/pages/Settings'))

function Fallback() {
  return <div className="min-h-[40vh] flex items-center justify-center"><Spinner className="size-6" /></div>
}

export default function App() {
  useTheme()
  return (
    <HashRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/copilot/:id" element={<CopilotWindow />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="interviews/:id" element={<InterviewDetail />} />
            <Route path="mock" element={<MockInterviews />} />
            <Route path="mock/:id" element={<MockSessionPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="performance" element={<Performance />} />
            <Route path="company" element={<CompanyResearch />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toasts />
    </HashRouter>
  )
}
