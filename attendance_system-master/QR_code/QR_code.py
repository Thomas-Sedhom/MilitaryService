import os.path

import qrcode
from PIL import Image, ImageDraw, ImageFont

from app.students.dtos.StudentQrCode import student_qrcode
from app.students.models import Student


def create_a4_page(data: list[student_qrcode]):
    a4_width = 2480
    a4_height = 3508
    margin = 25
    cols = 4
    rows = 6

    cell_width = (a4_width - 2 * margin) // cols
    cell_height = (a4_height - 2 * margin) // rows

    a4_img = Image.new('RGB', (a4_width, a4_height), 'white')
    draw = ImageDraw.Draw(a4_img)

    font_path = 'QR_code/NotoNaskhArabic-Regular.ttf'
    font_size = 30
    font = ImageFont.truetype(font_path, font_size)

    qr_size = 400  # Size of QR code

    for i, student in enumerate(data):
        row = i // cols
        col = i % cols

        x_start = margin + col * cell_width
        y_start = margin + row * cell_height

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=4,
            border=2,
        )
        qr.add_data(str(student.id))
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").resize((qr_size, qr_size))

        a4_img.paste(qr_img, (x_start + (cell_width - qr_size) // 2, y_start + 20))
        lines = [
            f"المسلسل: {student.seq_number}",
            f"الاسم الرباعي: {student.name}",
            f"الكلية: {student.faculty_name}"
        ]

        text_x = x_start + 330
        y = y_start + 20 + qr_size

        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            draw.text((text_x + (cell_width - qr_size - 40) - text_width, y),
                      line, font=font, fill='black')
            y += text_height + 10

    return a4_img


from fastapi.responses import StreamingResponse
from io import BytesIO


def generate_pdf(data: list[student_qrcode]):
    pages = []
    single_page = []

    for i in data:
        single_page.append(i)
        if len(single_page) == 24:
            pages.append(create_a4_page(single_page))
            single_page = []
    if single_page:
        pages.append(create_a4_page(single_page))

    # Save PDF in memory instead of disk
    output = BytesIO()
    if pages:
        pages[0].save(
            output,
            format="PDF",
            save_all=True,
            append_images=pages[1:],
            resolution=300,
            quality=100
        )

    output.seek(0)  # Move cursor to the beginning for streaming

    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename=QrCodes.pdf'}
    )


if __name__ == "__main__":
    generate_pdf()
