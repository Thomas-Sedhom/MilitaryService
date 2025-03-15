from sqlmodel import Session
from app.faculty.dtos.CreateFacultyDto import CreateFacultyDto
from app.faculty.models import Faculty
from app.students.models import Student
from app.students.repository import delete_student


def create_faculty(session: Session, faculty_dto: CreateFacultyDto):
    faculty = Faculty()
    faculty.name = faculty_dto.name
    faculty.is_male = faculty_dto.is_male
    session.add(faculty)
    session.commit()
    session.refresh(faculty)
    return faculty


def get_faculties(session: Session, is_male: bool):
    return session.query(Faculty).filter(
        Faculty.is_male == is_male
    ).all()


def update_faculty_name(session: Session, faculty_id: int, new_name: str):
    faculty = session.get(Faculty, faculty_id)
    if not faculty:
        return None
    if not (new_name is None):
        faculty.name = new_name
    session.commit()
    session.refresh(faculty)
    return faculty


def delete_faculty(session: Session, faculty_id: int):
    faculty = session.get(Faculty, faculty_id)
    if not faculty:
        return None

    # Delete students of the specified gender
    students_to_delete = session.query(Student).filter(
        Student.faculty_id == faculty_id,
    ).all()

    for student in students_to_delete:
        delete_student(session, student.id)
    session.delete(faculty)  # Delete faculty only if no opposite gender students left
    session.commit()

    return {
        "message": "Faculty deleted successfully"
    }
