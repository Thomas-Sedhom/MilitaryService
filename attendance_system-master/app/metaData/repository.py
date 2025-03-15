from sqlalchemy.orm import Session

from app.faculty.models import Faculty
from app.faculty.repository import delete_faculty


def reset_all_data(session: Session, is_male: bool):
    faculties = session.query(Faculty).filter_by(is_male=is_male).all()

    for faculty in faculties:
        delete_faculty(session, faculty.id)

    return {"message": "تم حذف قاعدة البيانات"}
