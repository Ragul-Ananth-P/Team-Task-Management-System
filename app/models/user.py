import enum

from sqlalchemy import Column, Integer, String, DateTime, Enum, func
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # will store the HASH, never plaintext
    role = Column(Enum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    projects = relationship("Project", back_populates="creator")
    tasks = relationship("Task", back_populates="assignee")