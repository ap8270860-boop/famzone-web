import './Hero.css'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__media" aria-hidden="true">
        <img className="hero__image" src="/famzone-hero-banner.png" alt="" />
        <div className="hero__scrim" />
      </div>
      <div className="hero__body shell" />
    </section>
  )
}

export default Hero
