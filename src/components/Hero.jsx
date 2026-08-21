import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const HERO_VIDEO_URL = 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/glowinn/hero.mp4'
function Hero() {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const play = video.play()
    if (play?.catch) play.catch(() => {})
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      setReady(true)
    }
  }, [])

  return (
    <section className="hero" id="top">
      <div className="hero__media" aria-hidden="true">
        <video ref={videoRef} className={`hero__video ${ready ? 'is-ready' : ''}`} src={HERO_VIDEO_URL} autoPlay muted loop playsInline preload="auto" onCanPlay={() => setReady(true)} />
        <div className="hero__scrim" />
      </div>
      <div className="hero__body shell">
        <a className="btn btn--pearl hero__cta" href="#products">Explore Our Products</a>
      </div>
    </section>
  )
}

export default Hero
