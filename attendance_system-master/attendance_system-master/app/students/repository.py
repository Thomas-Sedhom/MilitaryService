from sqlmodel import Session
from app.students.models import Student

def create_student(session: Session, student: Student):
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

def get_students(session: Session):
    return session.query(Student).all()


def get_student_by_id(session: Session, student_id: int):
    return session.get(Student, student_id)
