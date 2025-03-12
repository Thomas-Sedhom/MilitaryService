from datetime import datetime

from sqlmodel import SQLModel, Field
from typing import Optional


class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone_number: str
    grade: str
    seq_number: int
    faculty_id: int
    is_male: bool
    notes: str
    national_id: str
    photo_path: Optional[str] = Field(default=None)

    def to_json(self):
        return {"id": self.id,
                "name": self.name,
                "Grade": self.grade,
                "faculty_id": self.faculty_id,
                "phone_number": self.phone_number,
                "seq_number": self.seq_number,
                "is_male": self.is_male,
                "notes": self.notes,
                "photo": self.photo_path,
                "national_id": self.national_id}


class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    faculty_id: int = Field(foreign_key="student.faculty_id")
    entrance_time: datetime
    leave_time: Optional[datetime] = None
    is_male: bool = True

    def to_json(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "faculty_id": self.faculty_id,
            "entrance_time": self.entrance_time.isoformat(),
            "leave_time": self.leave_time.isoformat() if self.leave_time else None,
            "is_male": self.is_male
        }
