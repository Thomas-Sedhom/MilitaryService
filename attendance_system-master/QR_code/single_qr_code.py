import base64

import qrcode
from io import BytesIO

# def generate_qr_code(data: str) -> str:
#     """
#     Generates a QR code from the given data and returns it as a Base64-encoded string.
#     """
#     qr = qrcode.QRCode(
#         version=1,
#         error_correction=qrcode.constants.ERROR_CORRECT_L,
#         box_size=10,
#         border=4,
#     )
#     qr.add_data(data)
#     qr.make(fit=True)
#
#     img = qr.make_image(fill='black', back_color='white')
#
#     # Save image to BytesIO and convert to Base64
#     img_bytes = BytesIO()
#     img.save(img_bytes, format='PNG')
#     img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
#
#     return img_base64

def generate_qr_code(data: str, file_path: str):
    """
    Generates a QR code from the given data and saves it to the specified file path.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill="black", back_color="white")
    img.save(file_path, format="PNG")