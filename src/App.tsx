import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ToastProvider } from './components/common/Toast'
import { Layout } from './components/layout/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Articles = lazy(() => import('./pages/Articles'))
const Editor = lazy(() => import('./pages/Editor'))
const Images = lazy(() => import('./pages/Images'))
const Deploy = lazy(() => import('./pages/Deploy'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-[var(--color-text-tertiary)]">Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:id" element={<Editor />} />
              <Route path="/images" element={<Images />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
