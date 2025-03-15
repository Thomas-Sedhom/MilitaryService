// Utility Functions
let currentEndpoint = "entrance";
const approveBtn = document.getElementById("approveBtn_attend");
console.log(approveBtn);
const initializeCamera = async (videoElement, facingMode = "environment") => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    videoElement.srcObject = stream;
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve;
    });
    videoElement.play();
    return true;
  } catch (error) {
    console.error("خطأ في فتح الكاميرا:", error);
    return false;
  }
};

const fetchUserData = async (userId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/students/national/${userId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) throw new Error("المستخدم غير موجود");
    return await response.json();
  } catch (error) {
    console.error("مشكلة في تحميل بيانات العميل:", error);
    return null;
  }
};
const clearForm = () => {
  const elements = {
    id: document.getElementById(`userId`),
    name: document.getElementById(`userName`),
    national_id: document.getElementById(`userNationalId`),
    faculty: document.getElementById(`userFaculty`),
    seq: document.getElementById(`userSeq`),
    image: document.getElementById(`userImage`),
    notes: document.getElementById(`notice`),
  };

  elements.id.innerText = "";
  elements.name.innerText = "";
  elements.national_id.innerText = "";
  elements.faculty.innerText = "";
  elements.seq.innerText = "";
  elements.image.src = "";
  elements.notes.value = "";
};
const updateUserCard = (user, prefix = "") => {
  if (!user) return;

  const elements = {
    id: document.getElementById(`userId`),
    name: document.getElementById(`userName`),
    national_id: document.getElementById(`userNationalId`),
    faculty: document.getElementById(`userFaculty`),
    seq: document.getElementById(`userSeq`),
    image: document.getElementById(`userImage`),
    notes: document.getElementById(`notice`),
  };

  elements.id.innerText = user.id;
  elements.name.innerText = user.name;
  elements.national_id.innerText = user.national_id;
  elements.faculty.innerText = user.faculty_name;
  elements.seq.innerText = user.seq_number;
  elements.image.src = `http://127.0.0.1:8000/${user.photo}`;
  elements.notes.value = user.notes;
};

const approveStudent = async (userId, method = "POST") => {
  try {
    const noticeText = document.getElementById("notice").value;
    //todo: send notes
    const url = `http://127.0.0.1:8000/students/${userId}/${currentEndpoint}?notes=${noticeText}`;
    const response = await fetch(url, {
      method,
      headers: { Accept: "application/json" },
    });

    const result = await response.json();
    if(result.detail){
      throw new Error(result.detail)
    }
  } catch (error) {
    alert(error.message);
  }
};
const approveLeave = async (userId, notes, endpoint, method = "POST") => {
  try {
    const noticeText = document.getElementById("notice").value;
    //todo: send notes
    const url = `http://127.0.0.1:8000/students/${userId}/leave?notes=${noticeText}`;
    const response = await fetch(url, {
      method,
      headers: { Accept: "application/json" },
    });

    const result = await response.json();
    if(result.detail){
      throw new Error(result.detail)
    }
    } catch (error) {
    alert(error.message);
  }
};
// QR Code Scanner
let lastScanTime = 0;

const processQRCode = async (qrCodeData, callback) => {
  const currentTime = Date.now();
  if (currentTime - lastScanTime < 1000) return; // Prevent duplicate scans

  lastScanTime = currentTime;
  console.log("QR Code Data:", qrCodeData);

  const userId = qrCodeData.split(".")[1]; // Extract user ID
  if (userId) {
    try {
      const user = await fetchUserData(userId); // Fetch user data from API
      console.log("Fetched User:", user);

      if (user) {
        callback(user); // Pass the user data to the callback function
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  setTimeout(() => {
    lastScanTime = 0; // Reset after 1 second
  }, 1000);
};

const startScanner = async (videoElement, callback) => {
  if (!(await initializeCamera(videoElement))) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scanFrame = () => {
    if (!videoElement.srcObject) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) processQRCode(qrCode.data, callback);

    requestAnimationFrame(scanFrame);
  };

  scanFrame();
};

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById("camera");
  if (video) await initializeCamera(video, "user");

  const qrScanner = document.getElementById("qrScanner");
  if (qrScanner) {
    startScanner(qrScanner, (user) => {
      updateUserCard(user);
      document.getElementById("approveBtn_attend").disabled = false;
    });
  }

  const qrScannerLeave = document.getElementById("qrScannerLeave");
  if (qrScannerLeave) {
    startScanner(qrScannerLeave, (user) => {
      updateUserCard(user, "Leave");
      document.getElementById("approveBtnLeave").disabled = false;
    });
  }
  const approveButton = document.getElementById("approveBtn_attend");

  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const userId = document.getElementById("userId").innerText.trim();
      const notes = document.getElementById("notice").value.trim();
      approveStudent(userId);
      showNotification(true, "نم تسجيل الطالب بنجاح .");
      clearForm();
    });
  }
});

document
  .getElementById("approveBtnLeave")
  ?.addEventListener("click", async () => {
    const userId = document.getElementById("userIdLeave").innerText.trim();
    const notes = document.getElementById("noticeLeave").value.trim();
    approveStudent(userId);
  });

// Photo Capture
document.getElementById("capturePhoto")?.addEventListener("click", () => {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("photoCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth / 1.5;
  canvas.height = video.videoHeight / 1.5;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
});
document
  .getElementById("toggleAttendance")
  .addEventListener("change", function () {
    let label = document.getElementById("toggleLabel");
    let title = document.getElementById("goSectionTitle");
    if (this.checked) {
      label.textContent = "انصراف";
      currentEndpoint = "leave";
      title.innerText = "انصراف الطلبة";
    } else {
      label.textContent = "حضور";
      title.innerText = "حضور الطلبة";
      currentEndpoint = "entrance";
    }
    console.log(currentEndpoint);
  });