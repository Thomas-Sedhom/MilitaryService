from sqlalchemy.orm import Session
from sqlalchemy.sql import delete
import os

from sqlmodel import select

from app.students.models import Student, Attendance


def reset_all_data(session: Session, is_male: bool):
    # Retrieve all students matching the specified gender
    students = session.exec(select(Student).where(Student.is_male == is_male)).all()

    # Delete each student's photo using the photopath parameter
    for student in students:
        if student.photo_path and os.path.exists(student.photo_path):
            os.remove(student.photo_path)

    # Delete all attendance records matching the specified gender
    session.exec(delete(Attendance).where(Attendance.is_male == is_male))

    # Delete all students matching the specified gender
    session.exec(delete(Student).where(Student.is_male == is_male))

    # Commit the transaction to save changes in the database
    session.commit()
    return {
        "message" : "تم حذف قاعدة البياناتز"
    }