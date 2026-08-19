function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">Famzone</p>
        <h1 id="welcome-title">Your family space starts here.</h1>
        <p className="intro">
          The React and Vite foundation is ready for the next phase of the product.
        </p>
        <div className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          Setup complete
        </div>
      </section>
    </main>
  )
}

export default App
