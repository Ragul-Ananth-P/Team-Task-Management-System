import enum

from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.database import Base


class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.TODO)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")