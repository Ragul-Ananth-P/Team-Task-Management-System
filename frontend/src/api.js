const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "taskboard_token";

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

function formatError(data, status) {
  if (data && typeof data.detail === "string") return data.detail;
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((d) => {
        const field = (d.loc || []).filter((x) => x !== "body").join(".");
        return (field ? field + ": " : "") + d.msg;
      })
      .join("\n");
  }
  return `Request failed (${status})`;
}

async function request(path, options = {}, { auth = true } = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof URLSearchParams)) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API + path, { ...options, headers });
  } catch {
    throw new Error("Can't reach the API. Check that uvicorn is running and CORS is enabled.");
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (res.status === 401 && auth && token) onUnauthorized();
  if (!res.ok) throw new Error(formatError(data, res.status));
  return data;
}

const send = (method, path, body, opts) =>
  request(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }, opts);

export const api = {
  // auth
  login: (email, password) =>
    request(
      "/auth/login",
      { method: "POST", body: new URLSearchParams({ username: email, password }) },
      { auth: false }
    ),
  register: (body) => send("POST", "/auth/register", body, { auth: false }),
  me: () => request("/auth/me"),

  // read (any logged-in user)
  getUsers: () => request("/users"),
  getProjects: () => request("/projects"),
  getTasks: () => request("/tasks"),

  // admin only
  createUser: (body) => send("POST", "/users", body),
  updateUser: (id, body) => send("PUT", `/users/${id}`, body),
  deleteUser: (id) => send("DELETE", `/users/${id}`),
  createProject: (body) => send("POST", "/projects", body),
  updateProject: (id, body) => send("PUT", `/projects/${id}`, body),
  deleteProject: (id) => send("DELETE", `/projects/${id}`),
  createTask: (body) => send("POST", "/tasks", body),
  updateTask: (id, body) => send("PUT", `/tasks/${id}`, body),
  deleteTask: (id) => send("DELETE", `/tasks/${id}`),

  // admin, or the assigned employee
  setTaskStatus: (id, status) => send("PATCH", `/tasks/${id}/status`, { status }),
};
