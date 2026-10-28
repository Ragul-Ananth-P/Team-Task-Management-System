from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskResponse, TaskStatusUpdate, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def check_references(db: Session, project_id: int, assigned_to: int) -> None:
    if not db.get(Project, project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if not db.get(User, assigned_to):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned user not found")


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    check_references(db, task_in.project_id, task_in.assigned_to)
    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Task).order_by(Task.id).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_task_or_404(db, task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    task = get_task_or_404(db, task_id)
    check_references(db, task_in.project_id, task_in.assigned_to)
    for field, value in task_in.model_dump().items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    body: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_or_404(db, task_id)
    # To let employees change ANY task's status, delete this if-block.
    if current_user.role != UserRole.ADMIN and task.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update tasks assigned to you",
        )
    task.status = body.status
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    task = get_task_or_404(db, task_id)
    db.delete(task)
    db.commit()