import re
from io import BytesIO

import pdfplumber
from app.students.models import Student
import pdfplumber
from fastapi import APIRouter, File, Form, UploadFile, Depends
from sqlmodel import Session
def remove_new_line(name:str):
    names = []
    cur = ''
    for i in name:
        if i == '\n':
            if cur:
                names.append(cur)
            cur = ''
        else:
            cur += i
    if cur:
        names.append(cur)
    return " ".join(names[::-1])

def get_faculty_name(page:pdfplumber.page.Page):
    text = page.extract_text()
    match = re.search(r"ﺔﻌﻣﺎﺟ\s+(.*?)\s+ﺔﺒﻠﻄﻟ", text)
    return match.group(1)[::-1]

# TODO: PASS THE PDF THROUGH THE FUNCTION
import pdfplumber
from io import BytesIO
from fastapi import UploadFile

async def ReadPDF(file: UploadFile, is_male: bool = True):
    file_content = await file.read()  # Read file content as bytes

    students = []

    # Open PDF directly from memory
    with pdfplumber.open(BytesIO(file_content)) as pdf:
        faculty_name = get_faculty_name(pdf.pages[0])  # Extract faculty name from the first page

        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row[-1] and '0' <= row[-1][0] <= '9':
                        std = Student()
                        std.seq_number = int(row[-1])
                        std.name = remove_new_line(row[-2])[::-1]  # Reverse Arabic text if needed
                        std.national_id = row[-3]
                        std.is_male = is_male
                        students.append(std)

    return students, faculty_name

if __name__ == "__main__":
    ReadPDF()