let allStudents = []; // Store all students fetched from the API
let filteredStudents = []; // Store filtered students
const itemsPerPage = 4; // Number of items per page
let currentPage = 1; // Track the current page

document.querySelector('li[data-section="studentsList"]').addEventListener("click", function () {
  fetchAllStudents();
});
// Fetch all students from the API
async function fetchAllStudents() {
  const response = await fetch("http://127.0.0.1:8000/students/");
  console.log(response);

  if (!response.ok) {
    alert("فشل في جلب البيانات. الرجاء المحاولة مرة أخرى.");
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // Convert genderValue to a number
  let genderValue = localStorage.getItem("selectedGender" || '1'); 

  console.log("gender", genderValue, genderValue === 1, localStorage.getItem("selectedGender"));

  let data = await response.json();
  data = data.filter((student) => student.is_male == (genderValue === '1'));
  console.log(data);

  allStudents = data;
  filteredStudents = data;

  populateStudentsTable(filteredStudents);
  updatePagination(filteredStudents.length);
}


// Function to filter students based on user input
function filterStudents() {
  const nameValue = document.getElementById("filterByName").value.toLowerCase();
  const sequenceValue = document.getElementById("filterBySequence").value;
  const facultyValue = document
    .getElementById("filterByFaculty")
    .value.toLowerCase();
  const nationalIdValue = document.getElementById("filterByNationalId").value;

  filteredStudents = allStudents.filter((student) => {
    const normalizedStudentName = student.name.normalize('NFKD').toLowerCase();
    const normalizedNameValue = nameValue.normalize('NFKD').toLowerCase();
  
    const matchesName = normalizedStudentName.includes(normalizedNameValue);
    const matchesSequence = student.seq_number.toString().includes(sequenceValue);
    const matchesFaculty = student.faculty_name
      .normalize('NFKD')
      .toLowerCase()
      .includes(facultyValue.normalize('NFKD').toLowerCase());
    const matchesNationalId = student.national_id.includes(nationalIdValue);
  
    return (
      matchesName && matchesSequence && matchesFaculty && matchesNationalId
    );
  });
  
  currentPage = 1; // Reset to the first page after filtering
  populateStudentsTable(filteredStudents); // Populate the table with filtered students
  updatePagination(filteredStudents.length); // Update pagination controls
}

// Function to clear filters and show all students
function clearFilters() {
  document.getElementById("filterByName").value = "";
  document.getElementById("filterBySequence").value = "";
  document.getElementById("filterByFaculty").value = "";
  document.getElementById("filterByNationalId").value = "";
  filterStudents(); // Reapply filters (which will show all students)
}

// Function to populate the table with students
function populateStudentsTable(students) {
  const tableBody = document.querySelector("#studentsTable tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  // Calculate the start and end index for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  console.log(students);
  console.log(startIndex, endIndex);
  const paginatedStudents = students.filter((_, index) => index >= startIndex && index < endIndex);

  paginatedStudents.forEach((student) => {
    console.log(student.qrCode_path)
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.seq_number}</td>
            <td>${student.faculty_name}</td>
            <td>${student.national_id}</td>
            <td>                
            <img 
              id="qrImg"
                    class="qr-img"
                    src="../attendance_system-master/${student.qrCode_path}" 
                    data-name="${student.name}"
                    data-image="../attendance_system-master/${student.photo}" 
                    data-qr="../attendance_system-master/${student.qrCode_path}"
                    data-received="${student.qr_received}"
                    data-id="${student.id}"
                    onmouseover="showQrPopup(event)"
                    onmouseout="hideQrPopup()"
                ></td>
            <td>
                <div class="controlStudentControllsContainer">
                    <button class="icon-btn edit" onclick="showEditForm(${
                      student.id
                    })">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn stats" onclick="redirectToStatisticsPage(${
                      student.id
                    })">
                        <i class="fa-solid fa-chart-bar"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteStudent(${
                      student.id
                    })">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <button class="icon-btn image" onclick="showUpdateImageForm(${
                      student.id
                    })">
                        <i class="fa-solid fa-image"></i>
                    </button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}
function showQrPopup(event) {
  const img = event.target;
  const qrSrc = img.getAttribute("data-qr");
  const userName = img.getAttribute("data-name");
  const userImage = img.getAttribute("data-image");
  const received = img.getAttribute("data-received") === "true"; // Convert to boolean
  const studentId = img.getAttribute("data-id");

  const qrPopup = document.getElementById("qrPopup");
  qrPopup.innerHTML = `
        <img class="popup-image" src="${userImage}" alt="User Image">
        <h3>${userName}</h3>
        <img class="popup-qr" src="${qrSrc}" alt="QR Code">
        <p>Status: <strong>${received ? "✅ Received" : "❌ Not Received"}</strong></p>
        ${
          !received
            ? `<button class="receive-btn" onclick="updateUserQrReceivedStatus(${studentId})">وضع علامة كمستلم</button>`
            : ""
        }
    `;

  qrPopup.style.display = "block";
  // qrPopup.style.top = event.pageY + 20 + "px";
  qrPopup.style.left = event.pageX + 20 + "px";
}

// Prevent popup from disappearing when hovering over it
document.getElementById("qrPopup").addEventListener("mouseover", function () {
  this.style.display = "block";
});

// Hide popup only when the mouse leaves the popup
document.getElementById("qrPopup").addEventListener("mouseleave", function () {
  this.style.display = "none";
});

// Hide popup when moving away from the QR code (but not when hovering over the popup)
function hideQrPopup() {
  setTimeout(() => {
    if (!document.getElementById("qrPopup").matches(":hover")) {
      document.getElementById("qrPopup").style.display = "none";
    }
  }, 200); // Small delay to allow transition to the popup
}
async function updateUserQrReceivedStatus(studentId) {

  const response = await fetch(
    `http://127.0.0.1:8000/students/${studentId}/data?qr_received=${true}`,
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
    console.error("Error updating user:", response);
    alert("Failed to update user. Please try again.");
    throw new Error(`Failed to update user. Status: ${response.status}`);

  }

  const res = await response.json();
  console.log("Updated User:", res);

  alert("تم تحديث الطالب بنجاح!");

}
function markAsReceived(studentId) {
  `http://127.0.0.1:8000/students/${userId}/data?qr_received=${true}`,
      {
          method: "PUT",
          headers: { 
              "Accept": "application/json",
              "Content-Type": "application/json"  // Add if sending JSON body
          },
          mode: "cors",
      }
    .then((response) => {
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    })
    .then((data) => {
      alert(`Student ${data.name} has received the QR!`);
      hideQrPopup(); // Hide popup
      location.reload(); // Reload to update the UI
    })
    .catch((error) => console.error("Error:", error));
}
// Function to update pagination controls
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageInfo = document.getElementById("pageInfo");
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");

  // Update page info
  pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;

  // Enable/disable previous button
  prevButton.disabled = currentPage === 1;

  // Enable/disable next button
  nextButton.disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    populateStudentsTable(filteredStudents); // Update the table for the previous page
    updatePagination(filteredStudents.length); // Update pagination controls
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    populateStudentsTable(filteredStudents); // Update the table for the next page
    updatePagination(filteredStudents.length); // Update pagination controls
  }
});

// Event listeners for filter inputs
document
  .getElementById("filterByName")
  .addEventListener("input", filterStudents);
document
  .getElementById("filterBySequence")
  .addEventListener("input", filterStudents);
document
  .getElementById("filterByFaculty")
  .addEventListener("input", filterStudents);
document
  .getElementById("filterByNationalId")
  .addEventListener("input", filterStudents);

// Event listener for clear filters button
document
  .querySelector("button[onclick='clearFilters()']")
  .addEventListener("click", clearFilters);

// Initial fetch on page load
fetchAllStudents();

let lastGender = localStorage.getItem("selectedGender");

setInterval(() => {
  const currentGender = localStorage.getItem("selectedGender");
  if (currentGender !== lastGender) {
    console.log("Gender changed:", currentGender);
    lastGender = currentGender;
    fetchAllStudents(); // Re-fetch data
  }
}, 500)