from sqlmodel import Session, select, create_engine
from app.students.models import Student
from app.faculty.models import Faculty

DATABASE_URL = "sqlite:///../attendance.db"  # Ensure the path is correct
engine = create_engine(DATABASE_URL)


def seed_database():
    with Session(engine) as session:
        faculty_count = len(session.exec(select(Faculty)).all())
        student_count = len(session.exec(select(Student)).all())

        if faculty_count == 0:
            print("No data found in the faculties table. Adding default data...")
            faculties = [
                Faculty(name="Faculty of Engineering"),
                Faculty(name="Faculty of Medicine"),
                Faculty(name="Faculty of Science")
            ]
            session.add_all(faculties)
            session.commit()

        if student_count == 0:
            print("No data found in the students table. Adding default data...")
            students = [
                Student(name="Ahmed Ali", email="ahmed@example.com", age=22, faculty_id=1, seq_number=1,
                        photo_path="/home/mohab/PycharmProjects/attendance_system/StudentsImages/photo1.jpg",
                        is_male=True),
                Student(name="Sarah Mohamed", email="sarah@example.com", age=21, faculty_id=2, seq_number=2,
                        photo_path="/home/mohab/PycharmProjects/attendance_system/StudentsImages/photo2.jpg",
                        is_male=False),
                Student(name="Khaled Hassan", email="khaled@example.com", age=23, faculty_id=3, seq_number=34,
                        photo_path="/home/mohab/PycharmProjects/attendance_system/StudentsImages/photo2.jpg",
                        is_male=True)
            ]
            session.add_all(students)
            session.commit()

        print("✅ Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()
