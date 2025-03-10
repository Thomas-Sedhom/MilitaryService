from pydantic import BaseModel, EmailStr

class StudentDTO(BaseModel):
    name: str
    age: int
    seqNumber: int
    faculty_id: int
    is_male: bool

