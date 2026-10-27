const productionStages = [
  "Idea",
  "Universe",
  "Characters",
  "Story",
  "Scenes",
  "Shots",
  "Assets",
  "Audio",
  "Animation",
  "Render",
];

export default function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">RRAW STUDIO</p>
          <h1>Bring your story to life.</h1>
          <p className="hero-copy">
            Build worlds, direct scenes, create assets and produce cinematic
            animation from one recoverable workspace.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button">
              Create Project
            </button>
            <button className="secondary-button" type="button">
              Open Project
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-core" />
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">PRODUCTION PIPELINE</p>
          <h2>From idea to final frame</h2>
        </div>
        <span className="section-note">Local-first workspace</span>
      </div>

      <div className="pipeline-grid">
        {productionStages.map((stage, index) => (
          <div className="pipeline-card" key={stage}>
            <span className="pipeline-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="pipeline-stage">{stage}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
