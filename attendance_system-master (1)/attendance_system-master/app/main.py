from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from app.database import create_db_and_tables
from app.students.routes import router as student_router
from app.faculty.routes import router as faculty_router
from app.Reports.routes import router as reports_router
from app.metaData.routes import router as metadata_router

from fastapi.middleware.cors import CORSMiddleware
import os

UPLOAD_FOLDER = "static/photos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
PDF_FOLDER = "static/PDFs"
os.makedirs(PDF_FOLDER, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(reports_router)
app.include_router(metadata_router)

app.mount("/static", StaticFiles(directory="static"), name="static")
