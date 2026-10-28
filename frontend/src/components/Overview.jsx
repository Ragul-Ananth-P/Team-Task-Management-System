import { useState } from "react";
import { STATUSES, PRIORITIES, isLate } from "../utils.js";
import Avatar from "./Avatar.jsx";

const R = 62;
const C = 2 * Math.PI * R;

function Donut({ counts, total }) {
  const [hover, setHover] = useState(null);
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox="0 0 160 160" onMouseLeave={() => setHover(null)}>
        {total ? (
          counts.map((s) => {
            const len = (s.n / total) * C;
            const circle = (
              <circle
                key={s.key}
                className="seg"
                cx="80"
                cy="80"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="22"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                onMouseEnter={() => setHover(s)}
              />
            );
            offset += len;
            return circle;
          })
        ) : (
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--bg)" strokeWidth="22" />
        )}
        <text className="num" x="80" y="86">{hover ? hover.n : total}</text>
        <text className="lab" x="80" y="104">{hover ? hover.label : "Tasks"}</text>
      </svg>
      <div className="legend">
        {counts.map((s) => (
          <div key={s.key}>
            <i style={{ background: s.color }} />
            {s.label}
            <b>{s.n}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Overview({ users, projects, tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  const late = tasks.filter(isLate).length;

  const kpis = [
    ["Tasks", total, ""],
    ["Completed", total ? Math.round((done / total) * 100) + "%" : "0%", ""],
    ["Overdue", late, late ? "warn" : ""],
    ["Projects", projects.length, ""],
  ];

  const statusCounts = STATUSES.map((s) => ({ ...s, n: tasks.filter((t) => t.status === s.key).length }));
  const prioCounts = PRIORITIES.map((p) => ({ ...p, n: tasks.filter((t) => t.priority === p.key).length }));
  const prioMax = Math.max(1, ...prioCounts.map((p) => p.n));

  const load = users
    .map((u) => ({ u, n: tasks.filter((t) => t.assigned_to === u.id && t.status !== "COMPLETED").length }))
    .filter((x) => x.n)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const loadMax = Math.max(1, ...load.map((x) => x.n));

  return (
    <section className="active">
      <div className="kpis">
        {kpis.map(([label, value, cls]) => (
          <div key={label} className={`card kpi ${cls}`}>
            <div className="v">{value}</div>
            <div className="l">{label}</div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="card">
          <h3>Status</h3>
          <Donut counts={statusCounts} total={total} />
        </div>

        <div className="card">
          <h3>Priority</h3>
          <div className="bars">
            {prioCounts.map((p) => (
              <div key={p.key} className="bar">
                <b>{p.n}</b>
                <div className="fill" style={{ height: `${(p.n / prioMax) * 78}%`, background: p.color }} />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Workload</h3>
          <div className="load">
            {load.length ? (
              load.map(({ u, n }) => (
                <div key={u.id} className="r">
                  <Avatar user={u} />
                  <div className="track"><div style={{ width: `${(n / loadMax) * 100}%` }} /></div>
                  <b>{n}</b>
                </div>
              ))
            ) : (
              <div className="empty">No open tasks</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
