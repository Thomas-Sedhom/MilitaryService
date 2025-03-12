import pandas as pd
import os

from app.students.models import Student


def ReadSheet(df: pd.DataFrame, faculty_id: int, is_male: bool = True):
    ref_columns = {"الاسم الرباعي", "الرقم القومي", "المسلسل"}
    columns = set(df.columns)
    # TODO: check return
    if ref_columns - columns:
        return []
    # TODO: change based on the sheet al commander will hand to us
    students = []
    for i in range(df.shape[0]):
        std = Student()
        std.name = df["الاسم الرباعي"][i]
        std.national_id = str(df["الرقم القومي"][i])
        std.seq_number = int(df["المسلسل"][i])
        std.faculty_id = faculty_id
        std.is_male = is_male
        std.photo_path = ""
        std.notes = ""
        std.phone_number = ""
        std.grade = ""
        students.append(std)

    return students
