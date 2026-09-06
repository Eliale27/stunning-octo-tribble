import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

const Subjects = lazy(() => import('@/pages/Subjects'))
const SubjectDetail = lazy(() => import('@/pages/SubjectDetail'))
const Planner = lazy(() => import('@/pages/Planner'))
const Tasks = lazy(() => import('@/pages/Tasks'))
const Notes = lazy(() => import('@/pages/Notes'))
const Focus = lazy(() => import('@/pages/Focus'))
const Review = lazy(() => import('@/pages/Review'))
const Progress = lazy(() => import('@/pages/Progress'))
const Achievements = lazy(() => import('@/pages/Achievements'))
const Settings = lazy(() => import('@/pages/Settings'))

const Fallback = () => (
  <div className="flex h-64 items-center justify-center text-sm text-muted">
    <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
  </div>
)

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="materias" element={<Subjects />} />
          <Route path="materias/:id" element={<SubjectDetail />} />
          <Route path="planejamento" element={<Planner />} />
          <Route path="tarefas" element={<Tasks />} />
          <Route path="anotacoes" element={<Notes />} />
          <Route path="foco" element={<Focus />} />
          <Route path="revisao" element={<Review />} />
          <Route path="progresso" element={<Progress />} />
          <Route path="conquistas" element={<Achievements />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </HashRouter>
  )
}
