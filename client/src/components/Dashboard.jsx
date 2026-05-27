import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo, UserCheck } from "lucide-react";

export default function Dashboard({ data }) {
  if (!data) return <div className="empty">Loading dashboard...</div>;

  const cards = [
    { label: "Projects", value: data.projects, icon: FolderKanban },
    { label: "Tasks", value: data.totalTasks, icon: ListTodo },
    { label: "In progress", value: data.status.inProgress, icon: Clock3 },
    { label: "Done", value: data.status.done, icon: CheckCircle2 },
    { label: "Overdue", value: data.overdue, icon: AlertTriangle },
    { label: "Assigned to me", value: data.assignedToMe, icon: UserCheck }
  ];

  return (
    <section className="dashboard-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="metric-card" key={card.label}>
            <Icon size={20} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        );
      })}
    </section>
  );
}
