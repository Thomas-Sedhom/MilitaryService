from sqlmodel import SQLModel, Field
from typing import Optional


class Faculty(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    is_male : bool
