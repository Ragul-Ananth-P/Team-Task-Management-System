# Team Task Management System

A task management app where users register and log in, admins manage projects, tasks and users, and employees track the status of their work.

**Stack:** Python, FastAPI, SQLAlchemy ORM, PostgreSQL, JWT authentication, React (Vite)

## Features

- Register and log in with JWT tokens
- Passwords hashed with bcrypt, never stored or returned in plain text
- Role-based access control (ADMIN and EMPLOYEE)
- Users, projects and tasks with full validation
- Tasks must belong to an existing project and be assigned to an existing user
- React dashboard with charts, a Kanban board and role-aware screens

## Roles

|             Action                           | ADMIN            | EMPLOYEE                    |

| Register / log in                            | yes              | yes                         |
| View users, projects, tasks                  | yes              | yes                         |
| Create, edit, delete users, projects, tasks  | yes              | no                          |
| Change task status                           | any task         | only tasks assigned to them |

Public registration always creates an EMPLOYEE. Only an admin can create another admin.

## Project structure

```
team-task-management/
├── app/
│   ├── main.py            app setup, CORS, routers
│   ├── config.py          settings loaded from .env
│   ├── database.py        engine, session, Base
│   ├── core/
│   │   ├── security.py    password hashing, JWT create/decode
│   │   └── deps.py        get_current_user, require_admin
│   ├── models/            SQLAlchemy tables (User, Project, Task)
│   ├── schemas/           Pydantic request/response models
│   └── routers/           auth, users, projects, tasks
├── scripts/
│   └── create_admin.py    create or reset an admin account
├── frontend/              React (Vite) frontend
├── .env.example
└── requirements.txt
```

## Backend setup

```bash
python -m venv venv
source venv/Scripts/activate        
pip install -r requirements.txt
```

Create the database:

```sql
CREATE DATABASE task_management;
```

Copy `.env.example` to `.env` and fill in your values:

```
DATABASE_URL=postgresql://postgres:johnebi%401503@localhost:5432/task_management
SECRET_KEY=generate_with_python_-c_"import secrets; print(secrets.token_hex(32))"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Create the first admin (tables are created automatically on startup):

```bash
python -m scripts.create_admin
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Swagger UI: http://127.0.0.1:8000/docs

## Frontend setup

```bash
cd frontend-react
npm install
npm run dev
```

Open http://localhost:5173. The API address is set by `VITE_API_URL` in `frontend-react/.env`.

## API endpoints

| Method      | Endpoint                | Access                          |

| POST        | `/auth/register`        | public                          |
| POST        | `/auth/login`           | public                          |
| GET         | `/auth/me`              | logged in                       |
| POST        | `/users`                | admin                           |
| GET         | `/users`, `/users/{id}` | logged in                       |
| PUT, DELETE | `/users/{id}`           | admin                           |
| POST        | `/projects`             | admin                           |
| GET         | `/projects`             | logged in                       |
| PUT, DELETE | `/projects/{id}`        | admin                           |
| POST        | `/tasks`                | admin                           |
| GET         | `/tasks`, `/tasks/{id}` | logged in                       |
| PUT, DELETE | `/tasks/{id}`           | admin                           |
| PATCH       | `/tasks/{id}/status`    | admin, or the assigned employee |

Status codes: `201` created, `204` deleted, `400` invalid action, `401` not logged in, `403` not allowed, `404` not found, `409` conflict (duplicate email, record still in use), `422` validation error.

## How it works

1. **Request validation.** Pydantic schemas check every request body (required fields, email format, enums, password length) and return `422` before any code runs.
2. **Authentication.** `POST /auth/login` checks the password against its bcrypt hash and returns a signed JWT holding the user id and an expiry. The client sends it as `Authorization: Bearer <token>`.
3. **Authorization.** `get_current_user` decodes the token and loads the user from the database on every request, so role changes apply immediately. `require_admin` builds on it and returns `403` for non-admins.
4. **Data integrity.** Before saving a task or project, the API checks that the referenced project and user exist, returning a clear `404`. Database foreign keys and a unique email constraint are the safety net.
5. **Responses.** Response models never include the password field, so hashes cannot leak.

## Next steps

Filtering and pagination, Alembic migrations, automated tests.
