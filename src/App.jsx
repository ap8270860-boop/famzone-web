import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Chat from './components/Chat.jsx'
import Home from './components/Home.jsx'

const HOME_ROUTES = new Set([
  '/home',
  '/profile',
  '/circles',
  '/location-sharing',
  '/safety-settings',
  '/notifications',
  '/subscription',
  '/help',
  '/privacy-policy',
])

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    const handleUnauthorized = () => {
      window.history.replaceState({}, '', '/login')
      setPath('/login')
    }
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('sfamily:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('sfamily:unauthorized', handleUnauthorized)
    }
  }, [])

  if (path === '/chat') {
    return <Chat />
  }

  if (HOME_ROUTES.has(path)) {
    if (!localStorage.getItem('sfamily_token')) {
      window.history.replaceState({}, '', '/login')
      return <><Navbar /><main><Hero /></main></>
    }
    return <Home />
  }

  return <><Navbar /><main><Hero /></main></>
}

export default App
