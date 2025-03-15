from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, Depends
from sqlalchemy.orm import Session

from app.database import get_session
from app.students.dtos.UpdateStudentDto import UpdateStudentDto
from app.students.models import Student
from app.students.repository import (
    save_student, get_students, delete_student, get_user_student_by_id,
    update_student_data, update_student_photo, register_student_entrance,
    register_student_leave, save_students, get_user_student_by_national_id
)

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/")
async def create_student(
    name: str = Form(...),
    seq_number: int = Form(...),
    faculty_id: int = Form(...),
    is_male: bool = Form(...),
    national_id: str = Form(...),
    photo: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Create a new student"""
    student_data = Student(
        name=name,
        seq_number=seq_number,
        faculty_id=faculty_id,
        is_male=is_male,
        national_id=national_id
    )
    student = save_student(session, student_data, photo)
    return {"message": "Student created successfully", "student": student}


@router.get("/")
async def get_all_students(
        session: Session = Depends(get_session)):
    """Retrieve all students"""
    students = get_students(session)
    return students


@router.get("/{student_id}")
async def get_student_by_id(student_id: int, session: Session = Depends(get_session)):
    """Retrieve a student by ID"""
    student = get_user_student_by_id(session, student_id)
    return {"student": student}


@router.get("/national/{national_id}")
async def get_student_by_national_id(national_id: str, session: Session = Depends(get_session)):
    """Retrieve a student by National ID"""
    student = get_user_student_by_national_id(session, national_id)
    return student


@router.put("/{student_id}/data")
async def update_student_data_route(
    student_id: int,
    student_data: UpdateStudentDto = Depends(),
    session: Session = Depends(get_session)
):
    """Update student data"""
    return update_student_data(session, student_id, student_data)


@router.put("/{student_id}/photo")
async def update_student_photo_route(
    student_id: int,
    photo: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Update student photo"""
    return update_student_photo(session, student_id, photo)


@router.delete("/{student_id}")
async def delete_student_endpoint(student_id: int, session: Session = Depends(get_session)):
    """Delete a student"""
    return delete_student(session, student_id)

# ------------------- Bulk Student Operations -------------------

@router.post("/bulk-upload")
async def post_students_from_sheet(
    file: UploadFile = File(...),
    is_male: bool = Form(...),
    session: Session = Depends(get_session)
):
    """Upload multiple students from a sheet"""
    return await save_students(session, file, is_male)

# ------------------- Attendance Tracking -------------------

@router.post("/{student_id}/entrance")
def register_entrance_route(
    student_id: int,
    notes: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Register student entrance"""
    return register_student_entrance(session, student_id, notes)


@router.post("/{student_id}/leave")
def register_leave_route(
    student_id: int,
    notes: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Register student leave"""
    return register_student_leave(session, student_id, notes)
