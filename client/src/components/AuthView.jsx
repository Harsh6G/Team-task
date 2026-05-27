import { Lock, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthView() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await signup(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">
          <Lock size={22} />
        </div>
        <h1>Team Task Manager</h1>
        <p>Sign in to coordinate projects, assignments, deadlines, and progress.</p>

        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            <LogIn size={16} /> Login
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
            <UserPlus size={16} /> Signup
          </button>
        </div>

        <form onSubmit={submit} className="stack">
          {mode === "signup" && (
            <>
              <label>
                Name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength="2" />
              </label>
              <label>
                Role
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength="6"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
