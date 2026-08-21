import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Chat from './components/Chat.jsx'

function App() {
  if (window.location.pathname === '/chat') {
    return <Chat />
  }

  return <><Navbar /><main><Hero /></main></>
}

export default App
