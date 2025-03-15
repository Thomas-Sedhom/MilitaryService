import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///attendance.db")

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# دالة للحصول على جلسة اتصال بقاعدة البيانات
def get_session():
    with Session(engine) as session:
        yield session
