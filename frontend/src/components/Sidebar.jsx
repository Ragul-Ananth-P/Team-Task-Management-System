import Avatar from "./Avatar.jsx";

const ICONS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  tasks: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  projects: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14.5c2.2.7 3.5 2.5 3.5 5.5" />
    </>
  ),
};

const NAV = [
  ["overview", "Overview"],
  ["tasks", "Tasks"],
  ["projects", "Projects"],
  ["users", "Users"],
];

export default function Sidebar({ tab, onTab, status, user, onLogout }) {
  const text = { connecting: "…", ok: "Live", bad: "Offline" }[status];
  return (
    <aside className="side">
      <div className="brand">
        <div className="mark">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        Taskboard
      </div>
      <nav>
        {NAV.map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => onTab(key)}>
            <svg viewBox="0 0 24 24">{ICONS[key]}</svg>
            {label}
          </button>
        ))}
      </nav>

      <div className="foot">
        <div className="me">
          <Avatar user={user} large />
          <div className="me-text">
            <b>{user.name}</b>
            <span className="muted">{user.role === "ADMIN" ? "Admin" : "Employee"}</span>
          </div>
          <button className="mini" onClick={onLogout}>Log out</button>
        </div>
        <div className="conn">
          <span className={`dot ${status === "connecting" ? "" : status}`} />
          <span>{text}</span>
        </div>
      </div>
    </aside>
  );
}
