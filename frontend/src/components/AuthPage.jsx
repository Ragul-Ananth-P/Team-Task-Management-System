import { useState } from "react";

export default function AuthPage({ onLogin, onRegister, onError }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) await onLogin(f.email.trim(), f.password);
      else await onRegister(f.name.trim(), f.email.trim(), f.password);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand">
          <div className="mark">
            <svg viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          Taskboard
        </div>
        <h1>{isLogin ? "Sign in" : "Create account"}</h1>

        <form className="show" onSubmit={submit}>
          {!isLogin && (
            <>
              <label htmlFor="aName">Name</label>
              <input id="aName" value={f.name} onChange={set("name")} maxLength={100} required autoFocus />
            </>
          )}
          <label htmlFor="aEmail">Email</label>
          <input id="aEmail" type="email" value={f.email} onChange={set("email")} required autoFocus={isLogin} />
          <label htmlFor="aPass">Password</label>
          <input
            id="aPass"
            type="password"
            value={f.password}
            onChange={set("password")}
            required
            minLength={isLogin ? undefined : 8}
            maxLength={72}
            placeholder={isLogin ? "" : "8+ characters"}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button className="btn" type="submit" disabled={busy}>
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="swap">
          {isLogin ? "New here? " : "Have an account? "}
          <button className="link" type="button" onClick={() => setMode(isLogin ? "register" : "login")}>
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
