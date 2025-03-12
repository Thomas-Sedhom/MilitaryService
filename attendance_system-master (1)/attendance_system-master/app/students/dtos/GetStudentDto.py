from typing import Optional


class GetStudentDto:
    id: int
    name: str
    age: int
    seq_number: int
    faculty_id: int
    faculty_name: int
    is_male: bool
    photo_path: Optional[str]
