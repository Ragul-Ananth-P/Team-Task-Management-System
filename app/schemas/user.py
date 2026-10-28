from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserCreate(UserRegister):
    role: UserRole = UserRole.EMPLOYEE


class UserUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    role: UserRole
    password: str | None = Field(default=None, min_length=8, max_length=72)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)