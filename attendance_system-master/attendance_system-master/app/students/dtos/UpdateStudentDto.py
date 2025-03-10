from pydantic import BaseModel
from typing import Optional

class UpdateStudentDto(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    seqNumber: Optional[int] = None
    faculty_id: Optional[int] = None
    is_male: Optional[bool] = None
