import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "./api.js";
import { isAdminUser } from "./utils.js";
import AuthPage from "./components/AuthPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./components/Overview.jsx";
import Tasks from "./components/Tasks.jsx";
import Projects from "./components/Projects.jsx";
import Users from "./components/Users.jsx";
import Drawer from "./components/Drawer.jsx";
import TaskModal from "./components/TaskModal.jsx";
import Toasts from "./components/Toasts.jsx";

const TITLES = { overview: "Overview", tasks: "Tasks", projects: "Projects", users: "Users" };
const NEW = {
  tasks: { label: "+ New task", kind: "task" },
  projects: { label: "+ New project", kind: "project" },
  users: { label: "+ New user", kind: "user" },
};
const EMPTY = { users: [], projects: [], tasks: [] };

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => !!getToken());
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState("connecting");
  const [drawer, setDrawer] = useState(null); // { kind, item }
  const [selectedId, setSelectedId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, err = false) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, err }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), err ? 6000 : 2800);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setData(EMPTY);
    setTab("overview");
    setDrawer(null);
    setSelectedId(null);
    setStatus("connecting");
  }, []);

  // Expired or invalid token: back to the login page.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast("Session expired. Please sign in again.", true);
    });
  }, [logout, toast]);

  // Restore an existing session on page load.
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setBooting(false));
  }, []);

  const load = useCallback(async () => {
    try {
      const [users, projects, tasks] = await Promise.all([api.getUsers(), api.getProjects(), api.getTasks()]);
      setData({ users, projects, tasks });
      setStatus("ok");
    } catch (e) {
      setStatus("bad");
      toast(e.message, true);
    }
  }, [toast]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDrawer(null);
        setSelectedId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ---------- auth ----------
  const login = async (email, password) => {
    const { access_token } = await api.login(email, password);
    setToken(access_token);
    setUser(await api.me());
  };

  const register = async (name, email, password) => {
    await api.register({ name, email, password });
    toast("Account created");
    await login(email, password);
  };

  // ---------- actions ----------
  const openDrawer = (kind, item = null) => {
    if ((kind === "project" || kind === "task") && !item && !data.users.length) return toast("Add a user first", true);
    if (kind === "task" && !item && !data.projects.length) return toast("Add a project first", true);
    setSelectedId(null);
    setDrawer({ kind, item });
  };

  const saved = (msg) => {
    toast(msg);
    setDrawer(null);
    load();
  };

  const remove = async (label, action) => {
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await action();
      toast(`${label} deleted`);
      setSelectedId(null);
      load();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const moveTask = async (task, newStatus) => {
    if (task.status === newStatus) return;
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)) }));
    try {
      await api.setTaskStatus(task.id, newStatus);
    } catch (e) {
      toast(e.message, true);
    }
    load();
  };

  // ---------- render ----------
  if (booting) return null;

  if (!user) {
    return (
      <>
        <AuthPage onLogin={login} onRegister={register} onError={(m) => toast(m, true)} />
        <Toasts toasts={toasts} />
      </>
    );
  }

  const isAdmin = isAdminUser(user);
  const { users, projects, tasks } = data;
  const selected = tasks.find((t) => t.id === selectedId);

  return (
    <div className="app">
      <Sidebar tab={tab} onTab={setTab} status={status} user={user} onLogout={logout} />

      <main>
        <div className="top">
          <h1>{TITLES[tab]}</h1>
          {isAdmin && NEW[tab] && (
            <button className="btn" onClick={() => openDrawer(NEW[tab].kind)}>{NEW[tab].label}</button>
          )}
        </div>

        {tab === "overview" && <Overview users={users} projects={projects} tasks={tasks} />}
        {tab === "tasks" && (
          <Tasks
            users={users}
            projects={projects}
            tasks={tasks}
            user={user}
            onOpen={(t) => setSelectedId(t.id)}
            onMove={moveTask}
          />
        )}
        {tab === "projects" && (
          <Projects
            users={users}
            projects={projects}
            tasks={tasks}
            isAdmin={isAdmin}
            onEdit={(p) => openDrawer("project", p)}
            onDelete={(p) => remove(`"${p.name}"`, () => api.deleteProject(p.id))}
          />
        )}
        {tab === "users" && (
          <Users
            users={users}
            currentUser={user}
            isAdmin={isAdmin}
            onEdit={(u) => openDrawer("user", u)}
            onDelete={(u) => remove(`${u.name}`, () => api.deleteUser(u.id))}
          />
        )}
      </main>

      {drawer && (
        <Drawer
          key={`${drawer.kind}-${drawer.item?.id ?? "new"}`}
          kind={drawer.kind}
          item={drawer.item}
          users={users}
          projects={projects}
          currentUser={user}
          onClose={() => setDrawer(null)}
          onDone={saved}
          onError={(m) => toast(m, true)}
        />
      )}

      {selected && (
        <TaskModal
          task={selected}
          users={users}
          projects={projects}
          user={user}
          onClose={() => setSelectedId(null)}
          onStatus={(s) => moveTask(selected, s)}
          onEdit={() => openDrawer("task", selected)}
          onDelete={() => remove(`"${selected.title}"`, () => api.deleteTask(selected.id))}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}
