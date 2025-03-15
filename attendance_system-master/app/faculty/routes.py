from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.faculty.repository import create_faculty, get_faculties, update_faculty_name, delete_faculty
from app.faculty.dtos.CreateFacultyDto import CreateFacultyDto

router = APIRouter(prefix="/faculties", tags=["Faculties"])


@router.post("/")
def create_faculty_route(faculty_dto: CreateFacultyDto, session: Session = Depends(get_session)):
    return create_faculty(session, faculty_dto)


@router.get("/")
def get_faculties_route(
        is_male: bool = True,
        session: Session = Depends(get_session)):
    return get_faculties(session, is_male)


@router.put("/{faculty_id}")
def update_faculty_route(
        faculty_id: int,
        new_name: Optional[str],
        session: Session = Depends(get_session)
):
    updated_faculty = update_faculty_name(session, faculty_id, new_name)
    if not updated_faculty:
        return {"error": "Faculty not found"}
    return updated_faculty


@router.delete("/{faculty_id}")
def delete_faculty_route(
        faculty_id: int,
        session: Session = Depends(get_session)):
    result = delete_faculty(session, faculty_id)
    if not result:
        return {"error": "Faculty not found"}
    return result
