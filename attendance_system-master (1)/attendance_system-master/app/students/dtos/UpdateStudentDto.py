from pydantic import BaseModel
from typing import Optional


class UpdateStudentDto(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    grade: Optional[str] = None
    seqNumber: Optional[int] = None
    faculty_id: Optional[int] = None
    is_male: Optional[bool] = None
    notes: Optional[str] = None
    national_id: Optional[str] = None
