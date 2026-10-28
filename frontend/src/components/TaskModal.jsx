import { STATUSES, PRIORITIES, fmtFull, isLate, isAdminUser, canChangeStatus } from "../utils.js";
import Avatar from "./Avatar.jsx";

export default function TaskModal({ task, users, projects, user, onClose, onStatus, onEdit, onDelete }) {
  const assignee = users.find((u) => u.id === task.assigned_to);
  const project = projects.find((p) => p.id === task.project_id);
  const status = STATUSES.find((s) => s.key === task.status);
  const priority = PRIORITIES.find((p) => p.key === task.priority);
  const admin = isAdminUser(user);

  return (
    <div className="modal-wrap open" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{task.title}</h3>
        <div className="muted">{task.description}</div>
        <dl>
          <dt>Project</dt><dd>{project?.name}</dd>
          <dt>Assignee</dt><dd><Avatar user={assignee} /> {assignee?.name}</dd>
          <dt>Status</dt>
          <dd>
            {canChangeStatus(user, task) ? (
              <select
                className="status-select"
                value={task.status}
                onChange={(e) => onStatus(e.target.value)}
                aria-label="Status"
              >
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            ) : (
              status.label
            )}
          </dd>
          <dt>Priority</dt><dd><span className="prio" style={{ "--c": priority.color }}>{priority.label}</span></dd>
          {task.due_date && (
            <>
              <dt>Due</dt>
              <dd className={isLate(task) ? "late" : ""}>{fmtFull(task.due_date)}</dd>
            </>
          )}
          <dt>Updated</dt><dd>{fmtFull(task.updated_at)}</dd>
        </dl>
        <div className="actions left">
          {admin && <button className="mini" onClick={onEdit}>Edit</button>}
          {admin && <button className="mini danger" onClick={onDelete}>Delete</button>}
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
