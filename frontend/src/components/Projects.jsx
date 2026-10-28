import Avatar from "./Avatar.jsx";

export default function Projects({ users, projects, tasks, isAdmin, onEdit, onDelete }) {
  if (!projects.length) {
    return (
      <section className="active">
        <div className="empty">No projects</div>
      </section>
    );
  }

  return (
    <section className="active">
      <div className="pgrid">
        {projects.map((p) => {
          const pt = tasks.filter((t) => t.project_id === p.id);
          const done = pt.filter((t) => t.status === "COMPLETED").length;
          const pct = pt.length ? (done / pt.length) * 100 : 0;
          return (
            <div key={p.id} className="card proj">
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <div className="track g"><div style={{ width: `${pct}%` }} /></div>
              <div className="foot-row">
                <span>{done} / {pt.length} done</span>
                <Avatar user={users.find((u) => u.id === p.created_by)} />
              </div>
              {isAdmin && (
                <div className="actions">
                  <button className="mini" onClick={() => onEdit(p)}>Edit</button>
                  <button className="mini danger" onClick={() => onDelete(p)}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
