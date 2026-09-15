import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Icon } from '@/components/Icon'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
  const [confirmarSalir, setConfirmarSalir] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const inicial = (perfil?.nombre ?? session?.user.email ?? '?')
    .charAt(0)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-surface">
      {/* Backdrop del drawer en móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-on-background/40 lg:hidden"
          onClick={() => setMenuAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/* ------------------------------ Sidebar ------------------------------ */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col justify-between bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Marca */}
          <div className="flex h-16 items-center justify-between gap-space-sm bg-primary px-space-base text-on-primary">
            <div className="flex items-center gap-space-sm">
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
            {/* Cerrar drawer en móvil */}
            <button
              onClick={() => setMenuAbierto(false)}
              className="rounded-lg p-space-2xs hover:bg-white/10 lg:hidden"
              aria-label="Cerrar menú"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-space-2xs px-space-sm pt-space-md">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuAbierto(false)}
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
      <div className="lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-space-sm bg-surface-container-lowest/95 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-space-xl lg:left-64">
          <div className="flex min-w-0 items-center gap-space-sm">
            {/* Botón hamburguesa (móvil) */}
            <button
              onClick={() => setMenuAbierto(true)}
              className="rounded-lg p-space-xs text-on-surface-variant hover:bg-surface-container-high lg:hidden"
              aria-label="Abrir menú"
            >
              <Icon name="menu" className="text-2xl" />
            </button>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-headline-sm text-headline-sm text-primary">
                {institucion?.nombre_ie ?? 'Inventario Patrimonial'}
              </span>
              <span className="hidden truncate font-label-sm text-label-sm text-on-surface-variant sm:block">
                Gestión de bienes de la institución
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-space-sm sm:gap-space-md">
            <Link
              to="/perfil"
              title="Ver mi perfil"
              className="flex items-center gap-space-sm rounded-lg p-space-2xs hover:bg-surface-container-high"
            >
              <div className="hidden text-right sm:block">
                <div className="max-w-[180px] truncate font-label-md text-label-md font-semibold text-on-surface">
                  {perfil?.nombre ?? session?.user.email}
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">
                  {perfil?.rol ?? 'LECTOR'}
                </div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-md text-label-md font-bold text-on-primary">
                {inicial}
              </div>
            </Link>
            <button
              onClick={() => setConfirmarSalir(true)}
              className="rounded-lg p-space-xs text-on-surface-variant hover:bg-surface-container-high"
              title="Cerrar sesión"
            >
              <Icon name="logout" className="text-lg" />
            </button>
          </div>
        </header>

        <main className="min-h-screen bg-surface pt-16">
          <div className="mx-auto max-w-[1600px] p-space-md sm:p-space-xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmarSalir}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar la sesión?"
        confirmLabel="Cerrar sesión"
        icon="logout"
        onConfirm={() => {
          setConfirmarSalir(false)
          void signOut()
        }}
        onCancel={() => setConfirmarSalir(false)}
      />
    </div>
  )
}
