import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProgressProvider } from './context/ProgressContext'
import { Dashboard } from './pages/Dashboard'
import { Lessons } from './pages/Lessons'
import { LessonPage } from './pages/LessonPage'
import { Practice } from './pages/Practice'
import { Progress } from './pages/Progress'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <ProgressProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:slug" element={<LessonPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </ProgressProvider>
  )
}
