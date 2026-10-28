from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.database import Base, engine
from app.routers import auth, projects, tasks, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)


@app.get("/")
def health_check():
    return {"status": "ok"}