
document
  .getElementById("submitUserForm")
  .addEventListener("click", async function () {
    // Get input values
    const name = document.getElementById("name").value.trim();
    const phone_number = document.getElementById("phone_number").value.trim();
    const seqNumber = document.getElementById("seqNumber").value.trim();
    const facultyId = document.getElementById("faculty_id").value.trim();
    const national_id = document.getElementById("national_id").value.trim();

    // Validation: Ensure all fields (except name) contain only numbers
    const numberRegex = /^[0-9]+$/;

    if (!name) {
      showNotification(false,"يرجى إدخال الاسم.");
      return;
    }
    if (!numberRegex.test(phone_number)) {
      showNotification(false,"يجب أن يحتوي رقم الهاتف على أرقام فقط.");
      return;
    }
    if (!numberRegex.test(seqNumber)) {
      showNotification(false,"يجب أن يحتوي الرقم المسلسل على أرقام فقط.");
      return;
    }
    if (!numberRegex.test(facultyId)) {
      showNotification(false,"يجب أن يحتوي معرف الكلية على أرقام فقط.");
      return;
    }
    if (!numberRegex.test(national_id)) {
      showNotification(false,"يجب أن يحتوي الرقم القومي على أرقام فقط.");
      return;
    }

    // Get gender selection
    let genderValue = localStorage.getItem("selectedGender") || '1'; // Default to 1 if not set
    ;
    let isMale = genderValue === '1'; // Convert "1" (male) and "0" (female) to boolean

    // Capture photo from canvas
    const photoCanvas = document.getElementById("photoCanvas");
    const photoBase64 = photoCanvas.toDataURL("image/png");

    // Convert Base64 to File object
    const photoFile = dataURLToFile(photoBase64, "photo.png");

    // Create FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("seq_number", seqNumber);
    formData.append("faculty_id", facultyId);
    formData.append("is_male", isMale);
    formData.append("national_id", national_id);
    formData.append("photo", photoFile);

    const response = await fetch(`http://127.0.0.1:8000/students/`, {
        method: "POST",
        body: formData, // Automatically sets `multipart/form-data`
    });

    const res = await response.json();

    if (response.ok) {
        showNotification(true,"تم حفظ الطالب بنجاح!");

        // Clear the form fields after success
        document.getElementById("studentForm").reset();
        
        // Hide the captured image
        photoCanvas.style.display = "none";
    } else {
        alert(res.detail || "حدث خطأ أثناء حفظ الطالب.");
        console.error("Request failed:", error);
        alert("فشل الاتصال بالخادم.");
    }

});

/**
 * Convert a Base64 image to a File object
 */
function dataURLToFile(dataUrl, filename) {
  let arr = dataUrl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Function to capture photo from camera feed
 */
function capturePhoto() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("photoCanvas");
  const context = canvas.getContext("2d");

  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the current video frame onto the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show the captured image
  canvas.style.display = "block";
}