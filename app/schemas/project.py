from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class ProjectUpdate(ProjectCreate):
    pass


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)