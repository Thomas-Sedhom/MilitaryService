// add student logic
document.addEventListener("DOMContentLoaded", function () {
  const studentFormSection = document.getElementById("student");
  const openFormButton = document.getElementById("openStudentForm");
  const closeFormButton = document.getElementById("closeStudentForm");
  const allStudentsSection = document.getElementById("studentsList");
  const bulkUploadbutton = document.getElementById("bulkUploadButton");
  const bulkUPloadSection = document.getElementById("bulkUploadSection");
  // Show the Student Management form when clicking "Add Student"
  openFormButton.addEventListener("click", function () {
    studentFormSection.style.display = "block";
    allStudentsSection.style.display = "none";
  });

  // Hide the Student Management form when clicking "Cancel"
  closeFormButton.addEventListener("click", function () {
    studentFormSection.style.display = "none";
  });
  bulkUploadbutton.addEventListener("click", function () {
    allStudentsSection.style.display = "none";
    bulkUPloadSection.style.display = "block";
  });
});

//--------------------------------------------------------------------------------------------
window.addEventListener("beforeunload", function () {
  localStorage.setItem("scrollPosition", window.scrollY);
});

window.addEventListener("load", function () {
  setTimeout(() => {
    const scrollPosition = localStorage.getItem("scrollPosition");
    if (scrollPosition !== null) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }
  }, 100); // Delay to ensure DOM is fully rendered
});

// choose user gender
let selectedGender = localStorage.getItem("selectedGender") || '1'; // Default to 1 if not set

document.addEventListener("DOMContentLoaded", function () {
  const genderRadios = document.querySelectorAll('input[name="startedgender"]');

  // Set the selected radio button based on stored value
  genderRadios.forEach((radio) => {
    if (radio.value === selectedGender) {
      radio.checked = true;
    }

    radio.addEventListener("change", function () {
      selectedGender = this.value; // Store selected gender
      localStorage.setItem("selectedGender", selectedGender); // Save to localStorage
      console.log("Selected Gender:", selectedGender); // Debugging
      fetchFaculties()
    });
  });
});

// load current section
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section");
  const sidebarItems = document.querySelectorAll(".sidebar ul li");

  // Get last opened section from localStorage, or use the default
  const lastSection = localStorage.getItem("lastSection") || "student";

  function showSection(sectionId) {
    // Hide all sections
    sections.forEach((section) => (section.style.display = "none"));

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = "block";

      // Save the last opened section in localStorage
      localStorage.setItem("lastSection", sectionId);
    }
  }

  // Show the last opened section on page load
  showSection(lastSection);

  // Add event listener to each sidebar item
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section");
      if (sectionId === "statistics") {
        window.location.href = "statistics.html"; // Redirect to Statistics page
      } else {
        showSection(sectionId); // Show the section for other items
      }
    });
  });
});
//-------------------------------------------------------------------------------------------------
// create image file
function dataURLToFile(dataUrl, fileName) {
  let arr = dataUrl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}
//-------------------------------------------------------------------------------------------------

document
  .getElementById("saveFaculty")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    const facultyName = document.getElementById("facultyName").value;
    try {
      const confirmed = await showConfirmBox(
        `هل أنت متأكد من حفظ بيانات الكلية "${facultyName}"؟`
      );

      if (!confirmed) {
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/faculties/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: facultyName,
          is_male: selectedGender === '1'
        }),
      });
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("فشل في حفظ الكلية");
    }
  });

// fetchStudents(); // Fetch students when the page loads

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section");

  const lastSection = localStorage.getItem("lastSection") || "student";

  function showSection(sectionId) {
    // Hide all sections
    sections.forEach((section) => (section.style.display = "none"));

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = "block";

      // Save the last opened section in localStorage
      localStorage.setItem("lastSection", sectionId);
    }
  }
  showSection(lastSection);
  let students = [];

  document
    .getElementById("studentForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      addStudent();
    });


  window.editStudent = function (index) {
    let student = students[index];

    document.getElementById("name").value = student.name;
    document.getElementById("grade").value = student.age;
    document.getElementById("seqNumber").value = student.seqNumber;
    document.getElementById("faculty_id").value = student.faculty_id;

    students.splice(index, 1);
    populateStudentsTable();
  };

});
async function fetchFaculties() {
  try {
    const response = await fetch(`http://127.0.0.1:8000/faculties?is_male=${selectedGender === '1'}`);
    faculties = await response.json();
    updateFacultyTable();
    makeFacultiesDropDownMenu();
  } catch (error) {
    console.error("Error fetching faculties:", error);
  }
}
function makeFacultiesDropDownMenu() {
  const facultyDropdown = document.getElementById("faculty_id");
  facultyDropdown.innerHTML = '<option value="">اختر الكلية</option>'; // Reset dropdown

  faculties.forEach((faculty) => {
    const option = document.createElement("option");
    option.value = faculty.id; // Send ID when selected
    option.textContent = faculty.name; // Display name
    facultyDropdown.appendChild(option);
  });
}

  // Update the faculty table
  function updateFacultyTable() {
    facultyTable.innerHTML = ""; // Clear table before updating
    faculties.forEach((faculty, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${faculty.name}</td>
                <td>
                    <button type="button" onclick="deleteFaculty(event, ${
                      faculty.id
                    })">حذف</button>
                </td>
            `;
      facultyTable.appendChild(row);
    });
  }
document.addEventListener("DOMContentLoaded", async function () {
  const facultyForm = document.getElementById("facultyForm");
  const facultyTable = document.querySelector("#facultyTable tbody");
  let faculties = [];

  // Fetch faculty data from the API
  await fetchFaculties()

  // Handle form submission to add new faculty
  facultyForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission refresh

    const facultyName = document.getElementById("facultyName").value.trim();
    if (facultyName === "") return;

    const faculty = { name: facultyName };

    try {
      const response = await fetch("http://127.0.0.1:8000/faculties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faculty),
      });

      if (response.ok) {
        await fetchFaculties(); // Refresh the table after adding new faculty
        facultyForm.reset();
      } else {
        console.error("Failed to add faculty.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  window.deleteFaculty = async function (event, id) {
    if (event) {
      event.preventDefault(); // Stop default action
      event.stopPropagation(); // Prevent bubbling
    }

    try {
      const go_next = await showConfirmBox(
        "هل انت متأكد من انك تريد حذف الكلية ؟"
      );
      if (!go_next) return;
      const response = await fetch(`http://127.0.0.1:8000/faculties/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        faculties = faculties.filter((faculty) => faculty.id !== id);
        updateFacultyTable(); // Refresh table dynamically
      } else {
        console.error("Failed to delete faculty.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  fetchFaculties();
});

function redirectToStatisticsPage(studentId) {
  window.location.href = `statistics.html?id=${studentId}`;
}

// Function to delete a student
async function deleteStudent(studentId) {
  if (!confirm("هل انت متأكد من انك تريد ان تحذف الطالب ؟?")) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/students/${studentId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete student");
    }

    alert("تم حذف الطالب بنجاح!");
    await fetchStudents(); // Refresh the student list
  } catch (error) {
    console.error("Error deleting student:", error);
  }
}

function showEditForm(userId) {
  const editForm = document.getElementById("editUserForm");
  editForm.style.display = "block"; // Show the form

  // Fetch user data (Replace this with actual API call)
  fetch(`http://127.0.0.1:8000/students/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("data", data.student.name)
      document.getElementById("editUserId").value = data.student.id;
      document.getElementById("editName").value = data.student.name;
      document.getElementById("editSequence").value = data.student.seq_number;
      document.getElementById("editNationalId").value = data.student.national_id;
    })
    .catch((error) => console.error("Error fetching user:", error));
}

function closeEditForm() {
  document.getElementById("editUserForm").style.display = "none";
}

//---------------------------------------------------------------------------------------------------
// Update image logic
function showUpdateImageForm(userId) {
  document.getElementById("updateUserId").value = userId;
  document.getElementById("updateImageForm").style.display = "block";

  // Start the camera
  const video = document.getElementById("updateCamera");
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => console.error("Error accessing camera:", err));
}

function closeUpdateImageForm() {
  document.getElementById("updateImageForm").style.display = "none";
  const video = document.getElementById("updateCamera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop()); // Stop the camera stream
  }
}

function captureUpdatedPhoto() {
  const video = document.getElementById("updateCamera");
  const canvas = document.getElementById("updatePhotoCanvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function dataURLToFile(dataurl, filename) {
  let arr = dataurl.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
document
  .getElementById("uploadImageButton")
  .addEventListener("click", uploadUpdatedImage);

async function uploadUpdatedImage(event) {
  console.log(event);
  event.preventDefault(); // Prevent form submission and page refresh

  try {
    const userId = document.getElementById("updateUserId").value;
    const canvas = document.getElementById("updatePhotoCanvas");
    const photoBase64 = canvas.toDataURL("image/png");

    if (!photoBase64) {
      alert("قم بألتقاط الصورة اولا.");
      return;
    }

    const photoFile = dataURLToFile(photoBase64, "updated_photo.png");

    const formData = new FormData();
    formData.append("photo", photoFile);

    const response = await fetch(
      `http://127.0.0.1:8000/students/${userId}/photo`,
      {
        method: "PUT",
        body: formData,
      }
    );

    console.log(response);

    if (response.status != 200)
      throw new Error(`Failed to upload image. Status: ${response.status}`);

    alert("تم تحميل الصورة بنجاح!");
  } catch (error) {
    console.error("Error updating image:", error);
    alert("فشل في تحميل الصورة برجاء المحاولة مرة اخري.");
  }
}

async function updateUser() {
  
    const userId = document.getElementById("editUserId").value;
    const updatedName = document.getElementById("editName").value;
    const updatedSeq = document.getElementById("editSequence").value;
    const updatedNationalId = document.getElementById("editNationalId").value;

    const response = await fetch(
      `http://127.0.0.1:8000/students/${userId}/data?name=${updatedName}&seqNumber=${updatedSeq}&national_id=${updatedNationalId}`,
      {
          method: "PUT",
          headers: { 
              "Accept": "application/json",
              "Content-Type": "application/json"  // Add if sending JSON body
          },
          mode: "cors",
      }
  );

    if (!response.ok){
      console.error("Error updating user:", error);
      alert("فشل في تحديث الطالب برجاء المحاولة مرة اخري.");
      throw new Error(`Failed to update user. Status: ${response.status}`);

    }

    const res = await response.json();
    console.log("Updated User:", res);

    alert("تم تحديث الطالب بنجاح!");
    closeEditForm();

}
//--------------------------------------------------------------------------------------------------
// Upload excel sheet
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("excelFile");
  const form = document.getElementById("bulkUploadForm");


  // Call function to load faculties
  loadFaculties();

  // Handle Form Submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const filePathInput = document.getElementById("filePath");
    const gender = document.getElementById("gender");
    const submitButton = document.getElementById("uploadButton"); // Upload button
    const loadingIndicator = document.getElementById("loadingSpinner"); // Loading element
  
    let file = filePathInput.files[0]; // Get the selected file
  
    if (!file || !selectedGender) {
      alert("الرجاء ملئ جميع البيانات اولا.");
      return;
    }
  
    const isMale = selectedGender === '1'; // Convert string to boolean
    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_male", isMale);
  
    console.log("Uploading file:", file.name, "Gender:", isMale);
  
      // Show loading indicator & disable button
      submitButton.disabled = true;
      submitButton.innerText = "Uploading...";
      loadingIndicator.style.display = "inline-block";
  
      const response = await fetch("http://127.0.0.1:8000/students/bulk-upload", {
        method: "POST",
        body: formData,
      });
  
      console.log(response)
      if (response.ok) {
        alert("تم تحميل الملف بنجاح!");
        document.getElementById("bulkUploadForm").reset();
      } else {
        const errorData = await response.json();
        alert("فشل الرفع: " + JSON.stringify(errorData));
      }
      submitButton.disabled = false;
      submitButton.innerText = "Upload";
      loadingIndicator.style.display = "none";
  });
  
});
document.getElementById("resetButton").addEventListener("click", async function (event) {
  event.preventDefault();
  
  const confirmReset = await showConfirmBox("هل انت متأكد من انك تريد حذف كل البيانات ؟");

  if (confirmReset) {
    const isMale = selectedGender === '1';
    
    // Show loading indicator
    document.getElementById("resetButton").innerText = "جارٍ الحذف...";

      const response = await fetch(`http://127.0.0.1:8000/metadata/reset?is_male=${isMale}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      showNotification(true, "تم حذف جميع البيانات بنجاح .");
      document.getElementById("resetButton").innerText = 'مسح جميع البيانات'

  }
});

