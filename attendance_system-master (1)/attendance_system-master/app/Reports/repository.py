from sqlalchemy.orm import Session
from sqlmodel import select

from QR_code.QR_code import generate_pdf
from app.students.dtos.StudentQrCode import student_qrcode
from app.students.models import Student
from app.faculty.models import Faculty


def Generate_QrCodes(session: Session, students_ids: list[int], is_male: bool):
    students = []
    if not students_ids:
        statement = select(Student).where(Student.is_male == is_male)
    else:
        statement = select(Student).where(
            Student.id.in_(students_ids),
            Student.is_male == is_male
        )
    statement = statement.order_by(Student.faculty_id)
    student_records = session.exec(statement).all()

    for student in student_records:
        faculty = session.get(Faculty, student.faculty_id)
        student_qrCode = student_qrcode()
        student_qrCode.id = student.id
        student_qrCode.name = student.name
        student_qrCode.seq_number = student.seq_number
        student_qrCode.faculty_name = faculty.name
        students.append(student_qrCode)

    # Call the function to generate QR codes (implement separately)
    return generate_pdf(students)
