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
git clone <your-repo-url>
cd taskflow
```

### 2. Install server dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

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
Server starts at `http://localhost:5000`

**Frontend** (in a new terminal):
```bash
cd client
npm run dev
```
Client starts at `http://localhost:5173`. API requests are proxied to `http://localhost:5000` via Vite's dev proxy.

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
├── package.json             # Server package config
└── server/.env.example      # Example environment variables
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
7. Run the migration once after first deploy. You can do this via Railway's shell:
   ```bash
   node server/db/migrate.js
   ```

### Other Platforms (Render, Fly.io, Heroku, VPS)

1. Ensure **Node.js ≥ 20.19** is available on the host.
2. Set all environment variables listed in the [Configuration](#4-configure-environment-variables) section.
3. Run the build step: `npm run build`
4. Run the migration: `node server/db/migrate.js`
5. Start the server: `npm start`

For platforms that support a `Procfile`:

```
web: npm start
```

---

## API Overview

All API routes are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | — | Register a new user |
| POST | `/auth/login` | — | Login and receive JWT |
| GET | `/auth/me` | ✓ | Get current user |
| GET | `/dashboard` | ✓ | Dashboard stats and task summaries |
| GET | `/projects` | ✓ | List user's projects |
| POST | `/projects` | ✓ | Create a new project |
| GET | `/projects/:id` | ✓ | Get project details |
| DELETE | `/projects/:id` | ✓ Admin | Delete a project |
| GET | `/projects/:id/tasks` | ✓ | List tasks for a project |
| POST | `/projects/:id/tasks` | ✓ Admin | Create a task |
| PUT | `/tasks/:id` | ✓ Admin | Update a task |
| PATCH | `/tasks/:id/status` | ✓ Admin/Assignee | Update task status |
| DELETE | `/tasks/:id` | ✓ Admin | Delete a task |
| GET | `/projects/:id/members` | ✓ | List project members |
| POST | `/projects/:id/members` | ✓ Admin | Add a member by email |
| PUT | `/projects/:id/members/:userId` | ✓ Admin | Change member role |
| DELETE | `/projects/:id/members/:userId` | ✓ Admin | Remove a member |

---

## Database Schema

```sql
users           — id, name, email, password_hash, created_at
projects        — id, name, description, owner_id, created_at
project_members — project_id, user_id, role (admin|member), joined_at
tasks           — id, project_id, title, description, assignee_id,
                  created_by, status (todo|in_progress|done),
                  priority (low|medium|high), due_date, created_at
```

---

## License

MIT
