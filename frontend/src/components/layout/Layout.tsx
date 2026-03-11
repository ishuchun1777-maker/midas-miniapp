import { Outlet } from 'react-router-dom'
import { Sidebar, TopBar } from './Sidebar'
import { Toaster } from 'react-hot-toast'

export function Layout() {
  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar />
      <div className="flex-1 ml-60 transition-all duration-300">
        <TopBar />
        <main className="pt-14 min-h-screen">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f5f5f5',
            border: '1px solid #262626',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#f59e0b', secondary: '#0a0a0a' },
          },
        }}
      />
    </div>
  )
}
