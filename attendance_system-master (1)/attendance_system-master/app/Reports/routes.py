from datetime import date

from fastapi import APIRouter, Depends, Form, HTTPException
from sqlmodel import Session

from app.Reports.repository import Generate_QrCodes
from app.database import get_session
from app.students.repository import PDF_FOLDER
from reports.reports import faculty_report, day_report, general_report
from fastapi import Query

from typing import Optional
from fastapi import Query

router = APIRouter(prefix="/reports", tags=["Reports"])
startDate = date(2025, 3, 8)
from fastapi.responses import FileResponse


@router.get("/faculty_report/{faculty_id}")
def get_faculty_id_report(
        faculty_id: int,
        is_male: bool,
        session: Session = Depends(get_session)
):
    return faculty_report(session, faculty_id, startDate, is_male)

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
        session: Session = Depends(get_session)
):
    return general_report(session, startDate, is_male)


@router.get("/qr_code")
def get_qrcode_pdf(
        student_ids: Optional[list[int]] = Query(None),
        is_male: bool = Query(...),
        session: Session = Depends(get_session)
):
    return Generate_QrCodes(session, student_ids or [], is_male)
