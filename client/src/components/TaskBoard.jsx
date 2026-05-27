import { CalendarDays } from "lucide-react";

const columns = [
  ["todo", "To do"],
  ["in-progress", "In progress"],
  ["done", "Done"]
];

export default function TaskBoard({ tasks, user, onStatusChange }) {
  return (
    <section className="task-board">
      {columns.map(([status, label]) => (
        <div className="column" key={status}>
          <header>
            <h2>{label}</h2>
            <span>{tasks.filter((task) => task.status === status).length}</span>
          </header>
          <div className="task-list">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => {
                const canUpdate = user.role === "admin" || task.assignee?._id === user.id || task.assignee?._id === user._id;
                return (
                  <article className={`task-card priority-${task.priority}`} key={task._id}>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.description || "No description"}</p>
                    </div>
                    <div className="task-meta">
                      <span>{task.project?.name}</span>
                      <span>{task.assignee?.name}</span>
                    </div>
                    <div className="task-footer">
                      <span>
                        <CalendarDays size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <select value={task.status} disabled={!canUpdate} onChange={(e) => onStatusChange(task._id, e.target.value)}>
                        <option value="todo">To do</option>
                        <option value="in-progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </article>
                );
              })}
            {!tasks.some((task) => task.status === status) && <div className="empty small">No tasks</div>}
          </div>
        </div>
      ))}
    </section>
  );
}
