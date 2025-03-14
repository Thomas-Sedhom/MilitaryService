import os
from datetime import datetime
from io import BytesIO
from typing import Optional

import pandas as pd
import pytz
from fastapi import UploadFile, HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session
from sqlmodel import select

from app.faculty.models import Faculty
from app.students.dtos.UpdateStudentDto import UpdateStudentDto
from app.students.models import Attendance
from app.students.models import Student
from excel_sheet.ReadSheet import ReadSheet

UPLOAD_FOLDER = "static/photos"
photo_extension = ".jpg"
PDF_FOLDER = "static/PDFs"


def save_student(session: Session, student: Student, photo: UploadFile):
    """Save student to the database and store the photo file after checking faculty_id"""
    faculty = session.get(Faculty, student.faculty_id)
    if not faculty:
        raise HTTPException(status_code=400, detail="Invalid faculty ID")
    student.photo_path = ""
    student.notes = ""
    session.add(student)
    session.commit()
    session.refresh(student)

    # Save the uploaded photo with the student ID as filename
    photo_filename = f"{student.id}{photo_extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, photo_filename)

    with open(photo_path, "wb") as buffer:
        buffer.write(photo.file.read())

    # Update the student record with the saved photo path
    student.photo_path = photo_path
    session.commit()
    student_dict = student.to_json()
    student_dict["faculty_name"] = faculty.name
    return student_dict




def save_students(session: Session, sheet: UploadFile, faculty_id: int, is_male: bool):
    try:
        # Read the Excel file content
        contents = sheet.file.read()
        df = pd.read_excel(BytesIO(contents))

        # Validate faculty existence
        faculty = session.get(Faculty, faculty_id)
        if not faculty:
            raise HTTPException(status_code=400, detail="Invalid faculty ID")

        # Process and create student entries
        students = ReadSheet(df, faculty_id=faculty_id, is_male=is_male)

        # Save students to the database
        session.add_all(students)
        session.commit()

        return {"message": "تم حفظ الطلبة بنجاح"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def get_students(session: Session):
    query = session.query(Student)
    students = query.all()
    student_list = []
    for student in students:
        faculty = session.get(Faculty, student.faculty_id)
        faculty_name = faculty.name if faculty else "Unknown"
        student_info = student.to_json()
        student_info["faculty_name"] = faculty_name
        student_list.append(student_info)

    return student_list


def delete_student(session: Session, student_id: int):
    """Delete a student and remove their photo if it exists."""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    # Remove the student's photo if it exists
    if student.photo_path and os.path.exists(student.photo_path):
        os.remove(student.photo_path)

    # Delete all attendance records for the student
    session.exec(delete(Attendance).where(Attendance.student_id == student_id))

    # Delete the student record from the database
    session.delete(student)
    session.commit()

    return {"message": "تم حذف الطالب بنجاح"}


def get_user_student_by_id(session: Session, student_id: int):
    """Retrieve a student by ID, including faculty name."""

    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    faculty = session.get(Faculty, student.faculty_id)
    faculty_name = faculty.name if faculty else "غير معروف"

    # Fetch all attendance records for the student
    attendance_records = session.exec(
        select(Attendance).where(Attendance.student_id == student_id)
    ).all()

    # Calculate number of attended days
    attended_days = 0
    # Convert attendance records to JSON format
    attendance_list = []
    for record in attendance_records:
        if record.leave_time is None:
            continue
        attended_days += 1
        attendance_list.append(
            {
                "entrance_time": record.entrance_time.isoformat(),
                "leave_time": record.leave_time.isoformat() if record.leave_time else None,
            })
    # Convert student
    # object to dictionary and add extra details
    student_data = student.to_json()
    student_data["faculty_name"] = faculty_name
    student_data["attendance_records"] = attendance_list
    student_data["attended_days"] = attended_days
    return student_data


def update_student_data(session: Session, student_id: int, student_data: UpdateStudentDto):
    """Update only the student data without modifying the photo."""

    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    # Update fields only if they are provided
    if student_data.name is not None:
        student.name = student_data.name
    if student_data.grade is not None:
        student.grade = student_data.grade
    if student_data.faculty_id is not None:
        student.faculty_id = student_data.faculty_id
    if student_data.seqNumber is not None:
        student.seq_number = student_data.seqNumber
    if student_data.is_male is not None:
        student.is_male = student_data.is_male
    if student_data.national_id is not None:
        student.national_id = student_data.national_id
    session.commit()
    session.refresh(student)

    return {
        "message": "تم تحديث بيانات الطالب بنجاح",
        "student": student.to_json()
    }


def update_student_photo(session: Session, student_id: int, photo: Optional[UploadFile]):
    """Update only the student photo."""

    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    if not photo or not photo.filename:
        raise HTTPException(status_code=400, detail="يجب تحميل صورة صالحة")

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Remove the old photo if it exists
    if student.photo_path and os.path.exists(student.photo_path):
        os.remove(student.photo_path)

    # Save the new photo
    photo_filename = f"{student.id}{photo_extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, photo_filename)

    with open(photo_path, "wb") as buffer:
        buffer.write(photo.file.read())

    student.photo_path = photo_path
    session.commit()
    session.refresh(student)

    return {
        "message": "تم تحديث صورة الطالب بنجاح",
        "photo_path": student.photo_path
    }


def register_student_entrance(session: Session, student_id: int, notes: Optional[str]):
    """Register the entrance of a student, ensuring no duplicate entry for the same day."""

    # Retrieve student record
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    today_date = datetime.utcnow().date()

    # Check if the student has already registered entrance today
    existing_attendance = session.exec(
        select(Attendance).where(Attendance.student_id == student_id)
    ).all()

    for attendance in existing_attendance:
        if attendance.entrance_time.date() == today_date:
            raise HTTPException(status_code=400, detail="تم تسجيل دخول الطالب اليوم بالفعل")

    # Set timezone to Egypt (Africa/Cairo)
    eet_timezone = pytz.timezone("Africa/Cairo")
    current_time_eet = datetime.now(eet_timezone)

    # Create a new attendance record
    attendance = Attendance(
        student_id=student.id,
        faculty_id=student.faculty_id,
        entrance_time=current_time_eet,
        is_male=student.is_male
    )
    if notes:
        student.notes = notes
    session.add(attendance)
    session.commit()
    session.refresh(attendance)

    return {
        "message": "تم تسجيل دخول الطالب بنجاح",
        "attendance": attendance.to_json()
    }


def register_student_leave(session: Session, student_id: int, notes: Optional[str]):
    """Register the leave time for a student, ensuring a valid entrance record exists."""

    # Retrieve student record
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    # Get the current time in Cairo timezone
    eet_timezone = pytz.timezone("Africa/Cairo")
    current_time_eet = datetime.now(eet_timezone)
    today_date = current_time_eet.date()

    # Query the most recent attendance record for the student with no leave time
    statement = (
        select(Attendance)
        .where(Attendance.student_id == student_id, Attendance.leave_time == None)
        .order_by(Attendance.entrance_time.desc())
    )
    attendance = session.exec(statement).first()

    # Validate that an entrance record exists for today
    if not attendance:
        raise HTTPException(status_code=400, detail="لم يتم العثور على سجل دخول لهذا الطالب اليوم")
    if attendance.entrance_time.date() != today_date:
        raise HTTPException(status_code=400, detail="الطالب لم يسجل الدخول اليوم")

    # Update leave time
    attendance.leave_time = current_time_eet
    if notes:
        student.notes = notes
    session.commit()
    session.refresh(attendance)

    return {
        "message": "تم تسجيل خروج الطالب بنجاح",
        "attendance": attendance.to_json()
    }
