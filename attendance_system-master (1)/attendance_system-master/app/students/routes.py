from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from app.database import get_session
from app.students.dtos.UpdateStudentDto import UpdateStudentDto
from app.students.models import Student
from app.students.repository import save_student, get_students, delete_student, get_user_student_by_id, \
    update_student_data, update_student_photo, register_student_entrance, register_student_leave, save_students

router = APIRouter()


@router.post("/students/")
async def create_student(
        name: str = Form(...),
        seq_number: int = Form(...),
        faculty_id: int = Form(...),
        is_male: bool = Form(...),
        phone_number: str = Form(...),
        grade: str = Form(...),
        national_id: str = Form(...),
        photo: UploadFile = File(...),
        session: Session = Depends(get_session)
):
    student_data = Student()
    student_data.name = name
    student_data.seq_number = seq_number
    student_data.faculty_id = faculty_id
    student_data.is_male = is_male
    student_data.phone_number = phone_number
    student_data.grade = grade
    student_data.national_id = national_id
    student = save_student(session, student_data, photo)
    return {"message": "Student created successfully", "student": student}


@router.post("/students/sheet")
async def post_students_from_sheet(
        file: UploadFile = File(...),
        faculty_id: int = Form(...),
        is_male: bool = Form(...),
        session: Session = Depends(get_session)
):
    return save_students(session, file, faculty_id, is_male)


@router.get("/students")
async def get_all_students(
        session: Session = Depends(get_session)
):
    students = get_students(session)
    return {"students": students}


@router.get("/students/{student_id}")
async def get_student_by_id(
        student_id: int,
        session: Session = Depends(get_session)
):
    student = get_user_student_by_id(session, student_id)
    return {"students": student}


@router.delete("/students/{student_id}")
async def delete_student_endpoint(student_id: int, session: Session = Depends(get_session)):
    return delete_student(session, student_id)


@router.put("/students/{student_id}/data")
async def update_student_data_route(
        student_id: int,
        student_data: UpdateStudentDto = Depends(),
        session: Session = Depends(get_session)
):
    return update_student_data(session, student_id, student_data)


@router.put("/students/{student_id}/photo")
async def update_student_photo_route(
        student_id: int,
        photo: UploadFile = File(...),
        session: Session = Depends(get_session)
):
    return update_student_photo(session, student_id, photo)


@router.post("/students/{student_id}/entrance")
def register_entrance_route(
        student_id: int,
        notes: Optional[str] = None,
        session: Session = Depends(get_session)
):
    return register_student_entrance(session, student_id, notes)


@router.put("/attendance/{student_id}/leave")
def register_leave_route(
        student_id: int,
        notes: Optional[str] = None,
        session: Session = Depends(get_session)):
    return register_student_leave(session, student_id, notes)
