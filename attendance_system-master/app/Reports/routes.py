from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi import Query
from sqlmodel import Session

from app.Reports.repository import Generate_QrCodes
from app.database import get_session
from reports.reports import faculty_report, day_report, general_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/faculty_report/{faculty_id}")
def get_faculty_id_report(
        faculty_id: int,
        is_male: bool,
        start_date:date,
        session: Session = Depends(get_session)
):
    return faculty_report(session, faculty_id, start_date, is_male)

@router.get("/day_report")
def get_day_report(
        is_male: bool,
        day: date,
        session: Session = Depends(get_session)
):
    return day_report(session, day, is_male)


@router.get("/general_report")
def get_general_report(
        is_male: bool,
        start_date: date,
        session: Session = Depends(get_session)
):
    return general_report(session, start_date, is_male)


@router.get("/qr_code")
def get_qrcode_pdf(
        student_ids: Optional[list[int]] = Query(None),
        is_male: bool = Query(...),
        session: Session = Depends(get_session)
):
    return Generate_QrCodes(session, student_ids or [], is_male)
