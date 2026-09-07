import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Layout } from '@/components/Layout'
import { Spinner } from '@/components/ui'
import { LoginPage } from '@/pages/LoginPage'

// Carga diferida de los módulos (code-splitting: aísla recharts, exceljs, jspdf, xlsx)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const BienesPage = lazy(() =>
  import('@/pages/BienesPage').then((m) => ({ default: m.BienesPage })),
)
const RegistroPage = lazy(() =>
  import('@/pages/RegistroPage').then((m) => ({ default: m.RegistroPage })),
)
const AltasBajasPage = lazy(() =>
  import('@/pages/AltasBajasPage').then((m) => ({ default: m.AltasBajasPage })),
)
const ImportarPage = lazy(() =>
  import('@/pages/ImportarPage').then((m) => ({ default: m.ImportarPage })),
)
const ReportesPage = lazy(() =>
  import('@/pages/ReportesPage').then((m) => ({ default: m.ReportesPage })),
)
const FirmasPage = lazy(() =>
  import('@/pages/FirmasPage').then((m) => ({ default: m.FirmasPage })),
)

export default function App() {
  const { session, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Cargando…
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bienes" element={<BienesPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route path="altas-bajas" element={<AltasBajasPage />} />
          <Route path="importar" element={<ImportarPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="firmas" element={<FirmasPage />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
