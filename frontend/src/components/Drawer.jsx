import { useState } from "react";
import { api } from "../api.js";
import { blankToNull } from "../utils.js";

function useSubmit(action, onDone, onError) {
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      onDone(await action());
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, submit };
}

function TaskForm({ item, users, projects, onDone, onError }) {
  const [f, setF] = useState({
    title: item?.title ?? "",
    description: item?.description ?? "",
    project_id: item?.project_id ?? projects[0]?.id ?? "",
    assigned_to: item?.assigned_to ?? users[0]?.id ?? "",
    status: item?.status ?? "TODO",
    priority: item?.priority ?? "MEDIUM",
    due_date: item?.due_date ?? "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const { busy, submit } = useSubmit(
    async () => {
      const body = {
        title: f.title.trim(),
        description: blankToNull(f.description),
        project_id: +f.project_id || 0,
        assigned_to: +f.assigned_to || 0,
        status: f.status,
        priority: f.priority,
        due_date: f.due_date || null,
      };
      const t = item ? await api.updateTask(item.id, body) : await api.createTask(body);
      return `${t.title} ${item ? "updated" : "created"}`;
    },
    onDone,
    onError
  );

  return (
    <form className="show" onSubmit={submit} noValidate>
      <label htmlFor="tTitle">Title</label>
      <input id="tTitle" value={f.title} onChange={set("title")} maxLength={200} autoFocus />
      <label htmlFor="tDesc">Description</label>
      <textarea id="tDesc" value={f.description} onChange={set("description")} />
      <div className="row">
        <div>
          <label htmlFor="tProject">Project</label>
          <select id="tProject" value={f.project_id} onChange={set("project_id")}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tAssignee">Assignee</label>
          <select id="tAssignee" value={f.assigned_to} onChange={set("assigned_to")}>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor="tStatus">Status</label>
          <select id="tStatus" value={f.status} onChange={set("status")}>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Done</option>
          </select>
        </div>
        <div>
          <label htmlFor="tPriority">Priority</label>
          <select id="tPriority" value={f.priority} onChange={set("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>
      <label htmlFor="tDue">Due date</label>
      <input id="tDue" type="date" value={f.due_date} onChange={set("due_date")} />
      <button className="btn" type="submit" disabled={busy}>{item ? "Save" : "Create"}</button>
    </form>
  );
}

function ProjectForm({ item, onDone, onError }) {
  const [f, setF] = useState({ name: item?.name ?? "", description: item?.description ?? "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const { busy, submit } = useSubmit(
    async () => {
      const body = { name: f.name.trim(), description: blankToNull(f.description) };
      const p = item ? await api.updateProject(item.id, body) : await api.createProject(body);
      return `${p.name} ${item ? "updated" : "created"}`;
    },
    onDone,
    onError
  );

  return (
    <form className="show" onSubmit={submit} noValidate>
      <label htmlFor="pName">Name</label>
      <input id="pName" value={f.name} onChange={set("name")} maxLength={150} autoFocus />
      <label htmlFor="pDesc">Description</label>
      <textarea id="pDesc" value={f.description} onChange={set("description")} />
      <button className="btn" type="submit" disabled={busy}>{item ? "Save" : "Create"}</button>
    </form>
  );
}

function UserForm({ item, currentUser, onDone, onError }) {
  const [f, setF] = useState({
    name: item?.name ?? "",
    email: item?.email ?? "",
    password: "",
    role: item?.role ?? "EMPLOYEE",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isSelf = item && item.id === currentUser.id;

  const { busy, submit } = useSubmit(
    async () => {
      const base = { name: f.name.trim(), email: f.email.trim(), role: f.role };
      const u = item
        ? await api.updateUser(item.id, { ...base, password: f.password || null })
        : await api.createUser({ ...base, password: f.password });
      return `${u.name} ${item ? "updated" : "added"}`;
    },
    onDone,
    onError
  );

  return (
    <form className="show" onSubmit={submit} noValidate>
      <label htmlFor="uName">Name</label>
      <input id="uName" value={f.name} onChange={set("name")} maxLength={100} autoFocus />
      <label htmlFor="uEmail">Email</label>
      <input id="uEmail" type="email" value={f.email} onChange={set("email")} />
      <label htmlFor="uPass">Password</label>
      <input
        id="uPass"
        type="password"
        value={f.password}
        onChange={set("password")}
        maxLength={72}
        autoComplete="new-password"
        placeholder={item ? "Leave blank to keep" : "8+ characters"}
      />
      <label htmlFor="uRole">Role</label>
      <select id="uRole" value={f.role} onChange={set("role")} disabled={isSelf}>
        <option value="EMPLOYEE">Employee</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button className="btn" type="submit" disabled={busy}>{item ? "Save" : "Create"}</button>
    </form>
  );
}

const NAMES = { task: "task", project: "project", user: "user" };

export default function Drawer({ kind, item, users, projects, currentUser, onClose, onDone, onError }) {
  return (
    <div className="overlay open" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer">
        <div className="dhead">
          <h3>{item ? "Edit" : "New"} {NAMES[kind]}</h3>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {kind === "task" && (
          <TaskForm item={item} users={users} projects={projects} onDone={onDone} onError={onError} />
        )}
        {kind === "project" && <ProjectForm item={item} onDone={onDone} onError={onError} />}
        {kind === "user" && (
          <UserForm item={item} currentUser={currentUser} onDone={onDone} onError={onError} />
        )}
      </aside>
    </div>
  );
}
