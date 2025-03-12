from pydantic import BaseModel, EmailStr

from app.students.models import Student


class AddStudentDTO(BaseModel):
    name: str
    seqNumber: int
    faculty_id: int
    is_male: bool
    phone_number: str
    grade: str


    def to_student(self):
        std = Student()
        std.name = self.name
        std.grade = self.grade
        std.seqNumber = self.seqNumber
        std.faculty_id = self.faculty_id
        std.is_male = self.is_male
        std.phone_number = self.phone_number
        std.photo_path = ""
        return std
