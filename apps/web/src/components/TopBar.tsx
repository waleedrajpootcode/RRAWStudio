export default function TopBar() {
  return (
    <header className="studio-topbar">
      <div className="breadcrumb">
        <span className="breadcrumb-muted">Studio</span>
        <span className="breadcrumb-separator">/</span>
        <span>Overview</span>
      </div>

      <div className="topbar-actions">
        <button className="topbar-button" type="button">
          Search
          <span className="shortcut">Ctrl K</span>
        </button>
        <button className="topbar-icon-button" type="button" aria-label="Notifications">
          ?
        </button>
        <div className="profile-chip">
          <span className="profile-avatar">W</span>
          <span>Creator</span>
        </div>
      </div>
    </header>
  );
}
