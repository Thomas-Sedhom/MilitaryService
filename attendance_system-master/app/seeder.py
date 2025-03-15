import random
from datetime import datetime, timedelta
from sqlmodel import SQLModel, Field, Session, select, create_engine

from app.faculty.models import Faculty
from app.students.models import Student, Attendance

DATABASE_URL = "sqlite:///../attendance.db"
engine = create_engine(DATABASE_URL)


def seed_faculties(session: Session):
    faculties = [
        Faculty(id=1, name="كلية الطب"),
        Faculty(id=2, name="كلية العلوم"),
        Faculty(id=3, name="كلية الصيدلة"),
        Faculty(id=4, name="كلية الهندسة"),
        Faculty(id=5, name="كلية الحاسبات والمعلومات"),
        Faculty(id=6, name="كلية طب الاسنان"),
        Faculty(id=7, name="كلية التجارة"),
        Faculty(id=8, name="كلية الالسن"),
        Faculty(id=9, name="كلية التربية"),
        Faculty(id=10, name="كلية الحقوق"),
        Faculty(id=11, name="كلية الزراعة"),
        Faculty(id=12, name="كلية التربية النوعية"),
        Faculty(id=13, name="كلية البنات"),
        Faculty(id=14, name="كلية الآداب"),
        Faculty(id=15, name="كلية التمريض"),
        Faculty(id=16, name="كلية الدرسات العليا للطفولة"),
        Faculty(id=17, name="كلية الدراسات والبحوث البيئية"),
        Faculty(id=18, name="كلية الاثار"),
        Faculty(id=19, name="معهد البحوث الزراعية فى المناطق القاحلة"),
        Faculty(id=20, name="كلية الأعلام"),
        Faculty(id=21, name="كلية الطب البيطري"),
        Faculty(id=23, name="تجاره تعليم مفتوح"),
        Faculty(id=24, name="حقوق تعليم مفتوح"),
        Faculty(id=25, name="زراعه تعليم مفتوح"),
        Faculty(id=26, name="آداب تعليم مفتوح"),
        Faculty(id=27, name="معهد فني تمريض"),
    ]
    if not session.exec(select(Faculty)).all():
        session.add_all(faculties)
        session.commit()


def seed_students(session: Session):
    students = [
        Student(name="احمد على", phone_number="01012345678", grade=3, faculty_id=1, seq_number=1,
                is_male=True, national_id="12345678901234", notes="",qrCode_path=""),
        Student(name="سارة محمد", phone_number="01098765432", grade=2, faculty_id=2, seq_number=2,
                is_male=False, national_id="98765432109876", notes="",qrCode_path=""),
        Student(name="محمد خالد", phone_number="01111222333", grade=1, faculty_id=3, seq_number=3,
                is_male=True, national_id="11223344556677", notes="",qrCode_path=""),
    ]
    if not session.exec(select(Student)).all():
        session.add_all(students)
        session.commit()


def seed_attendance(session: Session):
    students = session.exec(select(Student)).all()
    if students:
        for student in students:
            entrance_time = datetime.now() - timedelta(days=random.randint(0, 5))
            leave_time = entrance_time + timedelta(hours=random.randint(3, 8))
            attendance = Attendance(student_id=student.id, faculty_id=student.faculty_id,
                                    entrance_time=entrance_time, leave_time=leave_time)
            session.add(attendance)
        session.commit()


def seed_database():
    with Session(engine) as session:
        seed_faculties(session)
        seed_students(session)
        seed_attendance(session)
        print("✅ Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()
