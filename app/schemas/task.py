from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    project_id: int = Field(gt=0)
    assigned_to: int = Field(gt=0)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    project_id: int
    assigned_to: int
    status: TaskStatus
    priority: TaskPriority
    due_date: date | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
class TaskUpdate(TaskCreate):
    pass


class TaskStatusUpdate(BaseModel):
    status: TaskStatus