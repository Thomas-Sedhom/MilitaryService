from datetime import date

from fastapi import APIRouter, Depends, Form
from sqlmodel import Session

from app.Reports.repository import Generate_QrCodes
from app.database import get_session
from app.metaData.repository import reset_all_data
from reports.reports import faculty_report, day_report, general_report
from fastapi import Query

from typing import Optional
from fastapi import Query

router = APIRouter(prefix="/metadata", tags=["metadata"])


@router.get("/reset")
def get_faculty_id_report(
        is_male: bool,
        session: Session = Depends(get_session)
):
    return reset_all_data(session, is_male)
