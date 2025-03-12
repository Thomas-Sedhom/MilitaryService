from sqlmodel import Session
from app.faculty.dtos.CreateFacultyDto import CreateFacultyDto
from app.faculty.models import Faculty


def create_faculty(session: Session, faculty_dto: CreateFacultyDto):
    faculty = Faculty()
    faculty.name = faculty_dto.name
    session.add(faculty)
    session.commit()
    session.refresh(faculty)
    return faculty


def get_faculties(session: Session):
    return session.query(Faculty).all()


def update_faculty_name(session: Session, faculty_id: int, new_name: str):
    faculty = session.get(Faculty, faculty_id)
    if not faculty:
        return None
    faculty.name = new_name
    session.commit()
    session.refresh(faculty)
    return faculty


def delete_faculty(session: Session, faculty_id: int):
    faculty = session.get(Faculty, faculty_id)
    if not faculty:
        return None  # أو raise Exception("Faculty not found")
    session.delete(faculty)
    session.commit()
    return {"message": "Faculty deleted successfully"}
