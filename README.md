# TaskFlow

A full-stack project and task management application with role-based access control, built with React, Node.js/Express, and PostgreSQL.

---

## Features

- **Authentication** — JWT-based signup and login
- **Projects** — Create, view, and delete projects
- **Tasks** — Kanban board (To Do / In Progress / Done) with priority, assignee, and due dates
- **Members** — Invite members by email, assign roles (admin / member)
- **Role-Based Access** — Admins can create/edit/delete tasks and manage members; members can update status of their assigned tasks
- **Dashboard** — Overview of project stats, recent tasks, and overdue items
- **Dark Mode** — Persisted theme toggle

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |

---

## Prerequisites

- **Node.js** v20.19.0 or higher
- **npm** v9+
- A **PostgreSQL** database (local or hosted, e.g. Railway, Supabase, Neon)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/mithun-ctrl/taskflow
cd taskflow
```

### 2. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | A long, random secret for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`, `24h`) |
| `PORT` | Port for the Express server (default: `5000`) |
| `CLIENT_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |

### 5. Run database migrations

This creates the required tables (`users`, `projects`, `project_members`, `tasks`):

```bash
node server/db/migrate.js
```

### 6. Start the development servers

Run the backend and frontend in separate terminals:

**Backend:**
```bash
npm run dev
```
Website starts at `http://localhost:5000`

---

## Project Structure

```
taskflow/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios instance with interceptors
│   │   ├── components/      # Shared UI components (Sidebar, TaskModal, etc.)
│   │   ├── context/         # React context (Auth, Theme)
│   │   └── pages/           # Route-level page components
│   └── vite.config.js       # Vite config with API proxy
│
├── server/
│   ├── controllers/         # Route handler logic
│   ├── db/
│   │   ├── pool.js          # PostgreSQL connection pool
│   │   ├── schema.sql       # Database schema
│   │   └── migrate.js       # Migration runner
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── rbac.js          # Role-based access control middleware
│   ├── routes/              # Express routers
│   └── index.js             # Express app entry point
│
├── .gitignore
├── package-lock.json
├── .env.example│
├── package.json             # Server package config
└── .env      # Example environment variables
```

---

## Building for Production

The build command installs all dependencies and compiles the React frontend:

```bash
npm run build
```

This runs:
1. `npm install` (server deps)
2. `npm install --prefix client` (client deps)
3. `npm run build --prefix client` (Vite production build → `client/dist/`)

The Express server then serves the built frontend as static files from `client/dist/` and handles the SPA fallback route.

---

## Running in Production

After building:

```bash
npm start
```

The server listens on the port defined in `process.env.PORT` (default `5000`) and serves both the API (`/api/*`) and the React app.

---

## Deployment

### Railway (recommended)

1. Push your repository to GitHub.
2. Create a new project on [Railway](https://railway.app) and connect your GitHub repo.
3. Add a **PostgreSQL** plugin to your Railway project.
4. Set the following environment variables in Railway's dashboard:

   ```
   DATABASE_URL=<auto-filled by Railway PostgreSQL plugin>
   JWT_SECRET=<generate a strong random string>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://<your-railway-domain>
   ```

5. Set the **start command** to:
   ```
   npm start
   ```
6. Set the **build command** to:
   ```
   npm run build
   ```

---

## License

MIT
