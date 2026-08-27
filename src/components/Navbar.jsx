import { useEffect, useState } from 'react'
import { MenuIcon } from './icons.jsx'
import AuthModal from './AuthModal.jsx'
import './Navbar.css'

// Active links displayed in header (Future links: 'Products', 'Our business', 'Clients', 'About')
const LINKS = ['Home']

const linkId = (label) => `#${label.toLowerCase().replace(/\s+/g, '-')}`

function Navbar() {
  const [active, setActive] = useState('Home')
  const [open, setOpen] = useState(false)
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' })

  useEffect(() => {
    // Check initial URL path on page load
    const path = window.location.pathname
    if (path === '/login') {
      setAuthModal({ isOpen: true, view: 'login' })
    } else if (path === '/register' || path === '/signup') {
      setAuthModal({ isOpen: true, view: 'signup' })
    }

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const currentPath = window.location.pathname
      if (currentPath === '/login') {
        setAuthModal({ isOpen: true, view: 'login' })
      } else if (currentPath === '/register' || currentPath === '/signup') {
        setAuthModal({ isOpen: true, view: 'signup' })
      } else {
        setAuthModal(prev => ({ ...prev, isOpen: false }))
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const select = (label) => {
    setActive(label)
    setOpen(false)
  }

  const openAuth = (view) => {
    const targetPath = view === 'signup' ? '/register' : '/login'
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath)
    }
    setAuthModal({ isOpen: true, view })
    setOpen(false)
  }

  const closeAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }))
    if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/signup') {
      window.history.pushState({}, '', '/')
    }
  }

  const handleModalViewChange = (newView) => {
    const targetPath = newView === 'signup' ? '/register' : '/login'
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath)
    }
    setAuthModal({ isOpen: true, view: newView })
  }

  const handleSuccess = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }))
    if (window.location.pathname !== '/home') {
      window.history.pushState({}, '', '/home')
      window.dispatchEvent(new Event('popstate'))
    }
  }

  return (
    <>
      <header className="nav">
        <div className="nav__inner shell">
          <a className="nav__brand" href="/home" onClick={() => select('Home')}>
            <img className="nav__logo" src="/glowinn-logo.jpeg" alt="" />
            <span>FamZone</span>
          </a>
          <div className="nav__actions">
            <button className="btn btn--ink" type="button" onClick={() => openAuth('login')}>Sign In / Login</button>
          </div>
          <button className="nav__toggle" type="button" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
            <MenuIcon open={open} />
          </button>
        </div>
        {open && <div className="nav__sheet shell">
          <button className="btn btn--pearl" type="button" onClick={() => openAuth('login')}>Sign In / Login</button>
        </div>}
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        initialView={authModal.view}
        onClose={closeAuth}
        onViewChange={handleModalViewChange}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Navbar
