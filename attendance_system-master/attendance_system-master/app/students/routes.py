from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import os
from sqlmodel import select
import pytz
from app.database import get_session
from app.faculty.models import Faculty
from app.students.dtos.GetStudentDto import GetStudentDto
from app.students.dtos.UpdateStudentDto import UpdateStudentDto
from app.students.models import Student, Attendance
from app.students.dtos.AddStudentDto import StudentDTO
from fastapi.responses import JSONResponse

UPLOAD_FOLDER = "StudentsImages"

router = APIRouter()
@router.get("/students")
async def get_all_students(
    faculty_id: Optional[int] = None,
    name: Optional[str] = None,
    seq_number: Optional[str] = None,  # Changed to str for substring matching
    session: Session = Depends(get_session)
):
    # Start building the query
    query = session.query(Student)

    # Apply filters if provided
    if faculty_id:
        query = query.filter(Student.faculty_id == faculty_id)
    if name:
        query = query.filter(Student.name.ilike(f"%{name}%"))  # Use ILIKE for case-insensitive search
    if seq_number:
        # Convert seq_number to string for substring matching
        query = query.filter(Student.seq_number == seq_number)

    # Fetch the filtered students
    students = query.all()

    if not students:
        raise HTTPException(status_code=404, detail="No students found with the given filters")

    # Prepare the response data with faculty name for each student
    student_list = []
    for student in students:
        faculty = session.get(Faculty, student.faculty_id)
        faculty_name = faculty.name if faculty else "Unknown"

        student_info = {
            "id": student.id,
            "name": student.name,
            "age": student.age,
            "seq_number": student.seq_number,
            "faculty_id": student.faculty_id,
            "faculty_name": faculty_name,
            "is_male": student.is_male,
            "photo_path": student.photo_path
        }

        student_list.append(student_info)

    return {"students": student_list}

@router.post("/students/")
async def create_student(
        student_data: StudentDTO = Depends(),
        photo: UploadFile = File(...),
        session: Session = Depends(get_session)
):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    student = Student(
        name=student_data.name,
        age=student_data.age,
        faculty_id=student_data.faculty_id,
        seq_number=student_data.seqNumber,
        is_male=student_data.is_male,
        photo_path=""
    )
    session.add(student)
    session.commit()
    session.refresh(student)

    photo_extension = os.path.splitext(photo.filename)[1]
    photo_filename = f"{student.id}{photo_extension}"
    photo_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, photo_filename))

    with open(photo_path, "wb") as buffer:
        buffer.write(await photo.read())

    student.photo_path = photo_path
    session.commit()

    return {"message": "Student created successfully", "student": student.to_json()}


@router.get("/students/{student_id}")
async def get_student_by_id(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    faculty = session.get(Faculty, student.faculty_id)
    faculty_name = faculty.name if faculty else "Unknown"

    return {
        "id": student.id,
        "name": student.name,
        "age": student.age,
        "seq_number": student.seq_number,
        "faculty_id": student.faculty_id,
        "faculty_name": faculty_name,
        "is_male": student.is_male,
        "photo_path": student.photo_path
    }


@router.put("/students/{student_id}")
async def update_student(
        student_id: int,
        student_data: UpdateStudentDto = Depends(),
        photo: Optional[UploadFile] = File(None),
        session: Session = Depends(get_session)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # تحديث البيانات فقط إذا تم إرسالها
    if student_data.name is not None:
        student.name = student_data.name
    if student_data.email is not None:
        student.email = student_data.email
    if student_data.age is not None:
        student.age = student_data.age
    if student_data.faculty_id is not None:
        student.faculty_id = student_data.faculty_id
    if student_data.seqNumber is not None:
        student.seq_number = student_data.seqNumber
    if student_data.is_male is not None:
        student.is_male = student_data.is_male

    # التأكد من أن الصورة تم إرسالها وليست سلسلة فارغة
    if photo and photo.filename:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # حذف الصورة القديمة إذا كانت موجودة
        if student.photo_path and os.path.exists(student.photo_path):
            os.remove(student.photo_path)

        # حفظ الصورة الجديدة
        photo_extension = os.path.splitext(photo.filename)[1]
        photo_filename = f"{student.id}{photo_extension}"
        photo_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, photo_filename))

        with open(photo_path, "wb") as buffer:
            buffer.write(await photo.read())

        student.photo_path = photo_path
    elif photo and not photo.filename:
        # Handle the case where the photo field is present but empty
        student.photo_path = None

    session.commit()
    session.refresh(student)

    return {
        "message": "Student updated successfully",
        "student": vars(student)
    }


@router.delete("/students/{student_id}")
async def delete_student(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # حذف الصورة إذا كانت موجودة
    if student.photo_path and os.path.exists(student.photo_path):
        os.remove(student.photo_path)

    # حذف الطالب من قاعدة البيانات
    session.delete(student)
    session.commit()

    return {"message": "Student deleted successfully"}


@router.post("/students/{student_id}/entrance")
def register_entrance(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    today_date = datetime.utcnow().date()

    statement = select(Attendance).where(
        (Attendance.student_id == student_id))
    existing_attendance = session.exec(statement).all()

    for attendance in existing_attendance:
        if attendance.entrance_time.date() == today_date:
            raise HTTPException(status_code=400, detail="Student has already registered entrance today")
    eet_timezone = pytz.timezone("Africa/Cairo")
    current_time_eet = datetime.now(eet_timezone)
    attendance = Attendance(
        student_id=student.id,
        faculty_id=student.faculty_id,
        entrance_time=current_time_eet,
    )
    session.add(attendance)
    session.commit()
    session.refresh(attendance)

    return {"message": "Entrance recorded successfully", "attendance": attendance.to_json()}


@router.put("/attendance/{student_id}/leave")
def register_leave(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    eet_timezone = pytz.timezone("Africa/Cairo")
    current_time_eet = datetime.now(eet_timezone)
    today_date = current_time_eet.date()

    statement = select(Attendance).where(
        (Attendance.student_id == student_id) &
        (Attendance.leave_time == None)
    ).order_by(Attendance.entrance_time.desc())

    attendance = session.exec(statement).first()
    if not attendance:
        raise HTTPException(status_code=400, detail="No entrance record found for this student today")
    if attendance.entrance_time.date() != today_date:
        raise HTTPException(status_code=400, detail="Student has not registered today")

    attendance.leave_time = current_time_eet
    session.commit()
    session.refresh(attendance)

    return {"message": "Leave recorded successfully", "attendance": attendance.to_json()}
