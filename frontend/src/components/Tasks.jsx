import { useState } from "react";
import { STATUSES, PRIORITIES, fmtDate, isLate, canChangeStatus } from "../utils.js";
import Avatar from "./Avatar.jsx";

export default function Tasks({ users, projects, tasks, user, onOpen, onMove }) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("");
  const [dragId, setDragId] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const userById = (id) => users.find((u) => u.id === id);
  const projectById = (id) => projects.find((p) => p.id === id);

  const list = tasks.filter(
    (t) =>
      (!q.trim() || t.title.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!project || t.project_id === +project) &&
      (!assignee || t.assigned_to === +assignee) &&
      (!priority || t.priority === priority)
  );

  const endDrag = () => {
    setDragId(null);
    setOverKey(null);
  };

  return (
    <section className="active">
      <div className="tools">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search tasks" />
        <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project">
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Assignee">
          <option value="">Everyone</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="">Any priority</option>
          {[...PRIORITIES].reverse().map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      <div className="board">
        {STATUSES.map((s) => {
          const items = list.filter((t) => t.status === s.key);
          return (
            <div
              key={s.key}
              className={`col ${overKey === s.key ? "over" : ""}`}
              style={{ "--c": s.color }}
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOverKey(s.key);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverKey(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const t = tasks.find((x) => x.id === dragId);
                endDrag();
                if (t) onMove(t, s.key);
              }}
            >
              <div className="col-head">{s.label}<span>{items.length}</span></div>
              {items.map((t) => {
                const pri = PRIORITIES.find((x) => x.key === t.priority);
                const movable = canChangeStatus(user, t);
                return (
                  <div
                    key={t.id}
                    className="task"
                    draggable={movable}
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(t.id));
                    }}
                    onDragEnd={endDrag}
                    onClick={() => onOpen(t)}
                  >
                    <h4>{t.title}</h4>
                    <div className="tags">
                      <span className="chip">{projectById(t.project_id)?.name}</span>
                      <span className="prio" style={{ "--c": pri.color }}>{pri.label}</span>
                    </div>
                    <div className="meta">
                      <span className={isLate(t) ? "late" : ""}>{t.due_date ? fmtDate(t.due_date) : ""}</span>
                      <Avatar user={userById(t.assigned_to)} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
