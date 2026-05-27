import { LogOut, RefreshCw, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import AuthView from "./components/AuthView.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProjectForm from "./components/ProjectForm.jsx";
import TaskBoard from "./components/TaskBoard.jsx";
import TaskForm from "./components/TaskForm.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { api } from "./lib/api.js";

export default function App() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    setNotice("");
    try {
      const [dashboardData, projectData, taskData] = await Promise.all([
        api("/dashboard"),
        api("/projects"),
        api("/tasks")
      ]);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      if (user.role === "admin") setUsers(await api("/auth/users"));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  async function createProject(payload) {
    try {
      await api("/projects", { method: "POST", body: JSON.stringify(payload) });
      await loadData();
      setNotice("Project created");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function createTask(payload) {
    try {
      await api("/tasks", { method: "POST", body: JSON.stringify(payload) });
      await loadData();
      setNotice("Task created");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function updateStatus(taskId, status) {
    try {
      const updated = await api(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setTasks((current) => current.map((task) => (task._id === taskId ? updated : task)));
      setDashboard(null);
      setDashboard(await api("/dashboard"));
    } catch (error) {
      setNotice(error.message);
    }
  }

  if (!user) return <AuthView />;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-row">
            <Shield size={24} />
            <strong>Task Manager</strong>
          </div>
          <p className="muted">Signed in as {user.name}</p>
          <span className="role-pill">{user.role}</span>
        </div>
        <button className="ghost" onClick={logout} type="button">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Project dashboard</h1>
            <p>Track team workload, due dates, and status changes.</p>
          </div>
          <button className="ghost" onClick={loadData} disabled={loading} type="button">
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {notice && <div className="notice">{notice}</div>}
        <Dashboard data={dashboard} />

        {user.role === "admin" && (
          <section className="form-grid">
            <ProjectForm users={users} onCreate={createProject} />
            <TaskForm projects={projects} onCreate={createTask} />
          </section>
        )}

        <section className="projects-strip">
          <h2>
            <Users size={18} /> Projects
          </h2>
          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project._id}>
                <strong>{project.name}</strong>
                <p>{project.description || "No description"}</p>
                <small>{project.members.length} members</small>
              </article>
            ))}
            {!projects.length && <div className="empty">No projects yet</div>}
          </div>
        </section>

        <TaskBoard tasks={tasks} user={user} onStatusChange={updateStatus} />
      </section>
    </main>
  );
}
