import { useEffect, useState } from 'react'
import { MenuIcon } from './icons.jsx'
import './Navbar.css'

// Active links displayed in header (Future links: 'Products', 'Our business', 'Clients', 'About')
const LINKS = ['Home']

const linkId = (label) => `#${label.toLowerCase().replace(/\s+/g, '-')}`

function Navbar() {
  const [active, setActive] = useState('Home')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const select = (label) => {
    setActive(label)
    setOpen(false)
  }

  return (
    <header className="nav">
      <div className="nav__inner shell">
        <a className="nav__brand" href="#top" onClick={() => select('Home')}>
          <img className="nav__logo" src="/glowinn-logo.jpeg" alt="" />
          <span>FamZone</span>
        </a>
        <nav className="nav__rail" aria-label="Primary">
          {LINKS.map((label) => <a key={label} href={linkId(label)} className={active === label ? 'is-active' : ''} onClick={() => select(label)}>{label}</a>)}
        </nav>
        <div className="nav__actions">
          <a className="nav__register" href="/chat">Register</a>
          <a className="btn btn--ink" href="#buy">Buy Now</a>
        </div>
        <button className="nav__toggle" type="button" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
          <MenuIcon open={open} />
        </button>
      </div>
      {open && <div className="nav__sheet shell">
        {LINKS.map((label) => <a key={label} href={linkId(label)} onClick={() => select(label)}>{label}</a>)}
        <a href="/chat" onClick={() => setOpen(false)}>Register</a>
        <a className="btn btn--pearl" href="#buy" onClick={() => setOpen(false)}>Buy Now</a>
      </div>}
    </header>
  )
}

export default Navbar
