import { Plus } from "lucide-react";
import { useState } from "react";

export default function ProjectForm({ users, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "", members: [] });

  async function submit(event) {
    event.preventDefault();
    await onCreate(form);
    setForm({ name: "", description: "", members: [] });
  }

  function toggleMember(id) {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id) ? current.members.filter((member) => member !== id) : [...current.members, id]
    }));
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      <h2>New project</h2>
      <label>
        Name
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength="2" />
      </label>
      <label>
        Description
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div>
        <span className="field-title">Team members</span>
        <div className="check-list">
          {users.map((user) => (
            <label className="check-row" key={user._id}>
              <input type="checkbox" checked={form.members.includes(user._id)} onChange={() => toggleMember(user._id)} />
              <span>{user.name}</span>
              <small>{user.role}</small>
            </label>
          ))}
        </div>
      </div>
      <button className="primary" type="submit">
        <Plus size={16} /> Add project
      </button>
    </form>
  );
}
