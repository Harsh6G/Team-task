import { ClipboardPlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function TaskForm({ projects, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    priority: "medium",
    dueDate: ""
  });

  const selectedProject = projects.find((project) => project._id === form.project);

  useEffect(() => {
    if (!form.project && projects[0]) setForm((current) => ({ ...current, project: projects[0]._id }));
  }, [projects, form.project]);

  useEffect(() => {
    if (selectedProject && !selectedProject.members.some((member) => member._id === form.assignee)) {
      setForm((current) => ({ ...current, assignee: selectedProject.members[0]?._id || "" }));
    }
  }, [selectedProject, form.assignee]);

  async function submit(event) {
    event.preventDefault();
    await onCreate(form);
    setForm((current) => ({ ...current, title: "", description: "", priority: "medium", dueDate: "" }));
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      <h2>New task</h2>
      <label>
        Project
        <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
          {projects.map((project) => (
            <option value={project._id} key={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength="2" />
      </label>
      <label>
        Assignee
        <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} required>
          {(selectedProject?.members || []).map((member) => (
            <option value={member._id} key={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <div className="two-col">
        <label>
          Priority
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        </label>
      </div>
      <label>
        Description
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <button className="primary" type="submit" disabled={!projects.length}>
        <ClipboardPlus size={16} /> Add task
      </button>
    </form>
  );
}
