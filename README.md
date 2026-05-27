# Team Task Manager

A full-stack MERN task manager with authentication, project/team management, role-based access, task assignment, status tracking, and dashboard metrics.

## Tech Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Run Locally

1. Install dependencies:

```bash
npm run install:all
```

2. Create `server/.env`:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=change-this-secret
CLIENT_URL=http://localhost:5173
```

3. Start MongoDB locally, then run:

```bash
npm run dev
```

The React app runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Roles

- `admin`: create projects, manage project members, create/update/delete tasks.
- `member`: view assigned/team projects and update the status of their assigned tasks.

