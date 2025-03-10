from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.crud import add_student, get_students

router = APIRouter()

@router.post("/students/")
def create_student(name: str, student_id: str, session: Session = Depends(get_session)):
    return add_student(session, name, student_id)

@router.get("/students/")
def list_students(session: Session = Depends(get_session)):
    return get_students(session)
