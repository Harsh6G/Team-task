# Team Task Manager

A full-stack team task management application for coordinating projects, assigning work, and tracking progress across a collaborative workspace.

## Overview

This project combines a React + Vite frontend with an Express + MongoDB backend. It supports:

- user authentication and account creation
- admin-managed project creation and member assignment
- task creation with due dates, priorities, and assignees
- interactive task status updates
- dashboard metrics for total tasks, overdue work, and assigned work

## Tech Stack

### Frontend

- React 19
- Vite 6
- Lucide icons

### Backend

- Node.js
- Express 4
- MongoDB + Mongoose
- JWT authentication
- Helmet, CORS, Morgan, bcryptjs, express-validator

## Project Structure

- `client/` — Vite React application
- `server/` — Express API and MongoDB models/routes
- `package.json` — workspace-level scripts using npm workspaces

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or reachable via a URI

### Install dependencies

From the workspace root:

```bash
npm install
```

This uses the root npm workspaces setup to install dependencies for both `client` and `server`.

### Environment variables

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=change-this-secret
CLIENT_URL=http://localhost:5173
```

### Run locally

Start MongoDB first, then run:

```bash
npm run dev
```

The root script launches the frontend and backend together:

- frontend: `http://localhost:5173`
- API: `http://localhost:5000`

### Other useful commands

```bash
npm run build
npm run start
npm run dev:client
npm run dev:server
```

## Application Features

### Authentication

- Login and signup flows with role-based accounts (`admin` or `member`)
- JWT-based session handling stored in browser local storage

### Admin workflow

- create projects and assign team members
- create tasks linked to a project and assignee
- manage team member visibility through project memberships

### Member workflow

- view accessible projects and tasks
- update the status of tasks assigned to them
- see dashboard counts such as overdue and assigned work

## API Overview

The API is served from `/api` and includes:

- `POST /api/auth/signup` — register a new user
- `POST /api/auth/login` — authenticate and receive a token
- `GET /api/projects` — list accessible projects
- `POST /api/projects` — create a project (admin only)
- `GET /api/tasks` — list visible tasks
- `POST /api/tasks` — create a task (admin only)
- `PATCH /api/tasks/:id` — update task details or status
- `GET /api/dashboard` — summary metrics for the authenticated user

## Notes

- The backend expects a valid MongoDB connection and a JWT secret.
- No dedicated test script is configured in the current workspace.
- The frontend uses a `VITE_API_URL` override if you need to point the client at a different API host.
