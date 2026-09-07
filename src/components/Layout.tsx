import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Icon } from '@/components/Icon'
import { useInstitucion } from '@/data/catalogos'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'space_dashboard', end: true },
  { to: '/bienes', label: 'Inventario', icon: 'inventory_2' },
  { to: '/registro', label: 'Registro Ágil', icon: 'add_box' },
  { to: '/altas-bajas', label: 'Altas y Bajas', icon: 'swap_horiz' },
  { to: '/importar', label: 'Importar Excel', icon: 'upload_file' },
  { to: '/reportes', label: 'Reportes', icon: 'description' },
  { to: '/firmas', label: 'Configuración', icon: 'settings' },
]

export function Layout() {
  const { session, perfil, signOut } = useAuth()
  const { data: institucion } = useInstitucion()
  const inicial = (perfil?.nombre ?? session?.user.email ?? '?')
    .charAt(0)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-surface">
      {/* ------------------------------ Sidebar ------------------------------ */}
      <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col justify-between bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col">
          {/* Marca */}
          <div className="flex h-16 items-center gap-space-sm bg-primary px-space-base text-on-primary">
            <Icon name="inventory_2" className="text-tertiary-fixed-dim text-2xl" />
            <div className="flex flex-col leading-tight">
              <span className="font-label-md text-label-md font-semibold uppercase tracking-wide">
                Inventario
              </span>
              <span className="font-label-sm text-label-sm text-surface-container-high opacity-90">
                Control Patrimonial
              </span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-space-2xs px-space-sm pt-space-md">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-space-sm rounded-lg px-space-md py-space-sm font-label-md text-label-md transition-colors ${
                    isActive
                      ? 'bg-primary-container font-semibold text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <Icon name={item.icon} className="text-lg" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* ------------------------------- Header ------------------------------ */}
      <div className="pl-64">
        <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface-container-lowest/95 px-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] backdrop-blur-md">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary">
              {institucion?.nombre_ie ?? 'Sistema de Inventario Patrimonial'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Gestión de bienes de la institución
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden text-right sm:block">
              <div className="font-label-md text-label-md font-semibold text-on-surface">
                {perfil?.nombre ?? session?.user.email}
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                {perfil?.rol ?? 'LECTOR'}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-label-md text-label-md font-bold text-on-primary">
              {inicial}
            </div>
            <button
              onClick={() => void signOut()}
              className="rounded-lg p-space-xs text-on-surface-variant hover:bg-surface-container-high"
              title="Cerrar sesión"
            >
              <Icon name="logout" className="text-lg" />
            </button>
          </div>
        </header>

        <main className="min-h-screen bg-surface pt-16">
          <div className="mx-auto max-w-[1600px] p-space-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
