// choose user gender
let selectedGender = "";

document.addEventListener("DOMContentLoaded", function () {
    const genderRadios = document.querySelectorAll('input[name="startedgender"]');

    genderRadios.forEach(radio => {
        radio.addEventListener("change", function () {
            selectedGender = this.value; // Store selected gender
            console.log("Selected Gender:", selectedGender); // Debugging
        });
    });
});
//-----------------------------------------------------------------------------------------
// Student filter part
document.addEventListener("DOMContentLoaded", function () {
    const filterByName = document.getElementById("filterByName");
    const filterBySequence = document.getElementById("filterBySequence");
    const filterByFaculty = document.getElementById("filterByFaculty");

    function filterStudents() {
        const nameValue = filterByName.value.toLowerCase();
        const sequenceValue = filterBySequence.value;
        const facultyValue = filterByFaculty.value;

        document.querySelectorAll("#studentsTable tbody tr").forEach(row => {
            const name = row.children[0].textContent.toLowerCase();
            const sequence = row.children[3].textContent;
            const faculty = row.children[4].textContent;

            const matchesName = name.includes(nameValue);
            const matchesSequence = sequenceValue === "" || sequence.includes(sequenceValue);
            const matchesFaculty = facultyValue === "" || faculty === facultyValue;

            row.style.display = matchesName && matchesSequence && matchesFaculty ? "" : "none";
        });
    }

    function clearFilters() {
        filterByName.value = "";
        filterBySequence.value = "";
        filterByFaculty.value = "";
        filterStudents();
    }

    filterByName.addEventListener("input", filterStudents);
    filterBySequence.addEventListener("input", filterStudents);
    filterByFaculty.addEventListener("input", filterStudents);
});
//--------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    const sidebarItems = document.querySelectorAll(".sidebar ul li");

    // Get last opened section from localStorage, or use the default
    const lastSection = localStorage.getItem("lastSection") || "student";

    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => section.style.display = "none");

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
    sidebarItems.forEach(item => {
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

document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", function(event) {
        event.preventDefault();
    });
});
document.getElementById("submitUserForm").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const seqNumber = document.getElementById("seqNumber").value;
    const facultyId = document.getElementById("faculty_id").value;

    let gender = document.querySelector('input[name="gender"]:checked').value;

    const photoCanvas = document.getElementById("photoCanvas");
    const photoBase64 = photoCanvas.toDataURL("image/png"); // ✅ Define it here
    console.log(photoBase64); // ✅ Now it will not be undefined

    const photoFile = dataURLToFile(photoBase64, "photo.png");

    // Create JSON object
    const studentData = {
        name,
        age,
        seqNumber,
        faculty_id,
    };

    try {
        if(gender == 'male'){
            gender = true;
            console.log(gender)
        }else{
            gender = false;
            console.log(gender);
        }
        const formData = new FormData();
        formData.append("photo", photoFile); // ✅ Append the file correctly
        console.log(name)
        const response = await fetch(`http://127.0.0.1:8000/students/?name=${name}&age=${age}&seqNumber=${seqNumber}&faculty_id=${facultyId}&is_male=${gender}`, {
            method: "POST",
            body:formData,
            credentials: 'include'
        });

        const result = await response.json();
        alert("Student saved successfully!");
        console.log(result);
    } catch (error) {
        const result = await response;

        console.error("Error:", result);
        alert("Failed to save student.");
    }
});

document.getElementById("facultyForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const facultyName = document.getElementById("facultyName").value;
    try {
        const response = await fetch(`http://127.0.0.1:8000/faculties/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body:JSON.stringify({
                name: facultyName
            }),
            credentials: 'include'
        });

        const result = await response.json();
        alert("Faculty saved successfully!");
        console.log(result);
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to save Faculty.");
    }
});



function capturePhoto() {
    let video = document.getElementById('camera');
    let canvas = document.getElementById('photoCanvas');
    let ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth / 1.5;
    canvas.height = video.videoHeight/1.5;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}
let video = document.getElementById("qrScanner");
let userDataDiv = document.getElementById("userData");
let approveBtn = document.getElementById("approveBtn");
let rejectBtn = document.getElementById("rejectBtn");
let scanning = false;

async function startScanner() {
    scanning = true;
    // userDataDiv.innerText = "Scanning...";
    approveBtn.disabled = true;
    rejectBtn.disabled = true;

    // Access Camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;

    // Start scanning process
    scanFrame();
}

async function scanFrame() {
    const video = document.getElementById("qrScanner");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame); // Try again on next frame
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        // document.getElementById("userData").innerText = `QR Code: ${qrCode.data}`;
        fetchUserData(qrCode.data.split('.')[1])
    } else {
        requestAnimationFrame(scanFrame); // Continue scanning
    }
}

async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/students/${userId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
            credentials: "include", // If your API requires authentication cookies
        });

        if (!response.ok) {
            throw new Error("User not found");
        }
        const user = await response.json();
        console.log(user)

        // Update user card
        console.log(document.querySelector("#userId"))
        console.log(user.photo_path)
        document.getElementById("userId").innerText = user.id;
        document.getElementById("userName").innerText = user.name;
        document.getElementById("userAge").innerText = user.age;
        document.getElementById("userFaculty").innerText = user.faculty_id;
        // document.getElementById("profileImage").innerHTML = ``

        // Enable buttons
        document.getElementById("approveBtn").disabled = false;
        document.getElementById("rejectBtn").disabled = false;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Dummy function to simulate QR scan and fetch user data


function approve() {
    alert("User Approved!");
}

function reject() {
    alert("User Rejected!");
}
async function startScannerLeave() {
    const video = document.getElementById("qrScannerLeave");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
            scanFrameLeave(); // Start scanning only when the video is ready
        };
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

async function scanFrameLeave() {
    const video = document.getElementById("qrScannerLeave");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrameLeave); // Try again on the next frame
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        document.getElementById("userDataLeave").innerText = `QR Code: ${qrCode.data}`;
        document.getElementById("approveBtnLeave").disabled = false;
        document.getElementById("rejectBtnLeave").disabled = false;
    } else {
        requestAnimationFrame(scanFrameLeave); // Continue scanning
    }
}

function approveLeave() {
    alert("Leave request approved!");
}

function rejectLeave() {
    alert("Leave request rejected!");
}
document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("camera");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (error) {
                console.error("Error accessing camera:", error);
            });
    } else {
        alert("Camera access not supported in this browser.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    showSection()
    let students = [];

    document.getElementById("studentForm").addEventListener("submit", function (event) {
        event.preventDefault();
        addStudent();
    });

    function addStudent() {
        let student = {
            name: document.getElementById("name").value,
            age: document.getElementById("age").value,
            seqNumber: document.getElementById("seqNumber").value,
            faculty_id: document.getElementById("faculty_id").value
        };

        students.push(student);
        updateStudentTable();
        document.getElementById("studentForm").reset();
    }

    function updateStudentTable() {
        let tableBody = document.querySelector("#studentsTable tbody");
        tableBody.innerHTML = "";

        students.forEach((student, index) => {
            let row = tableBody.insertRow();
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.age}</td>
                <td>${student.seqNumber}</td>
                <td>${student.faculty_id}</td>
                <td>
                    <button onclick="editStudent(${index})">Edit</button>
                    <button onclick="deleteStudent(${index})">Delete</button>
                </td>
            `;
        });
    }

    window.editStudent = function (index) {
        let student = students[index];

        document.getElementById("name").value = student.name;
        document.getElementById("age").value = student.age;
        document.getElementById("seqNumber").value = student.seqNumber;
        document.getElementById("faculty_id").value = student.faculty_id;

        students.splice(index, 1);
        updateStudentTable();
    };

    window.deleteStudent = function (index) {
        students.splice(index, 1);
        updateStudentTable();
    };
});
document.addEventListener("DOMContentLoaded", async function () {
    const facultyForm = document.getElementById("facultyForm");
    const facultyTable = document.querySelector("#facultyTable tbody");
    let faculties = [];

    // Fetch faculty data from the API
    async function fetchFaculties() {
        try {
            const response = await fetch("http://127.0.0.1:8000/faculties");
            faculties = await response.json();
            updateFacultyTable();
            makeFacultiesDropDownMenu()
        } catch (error) {
            console.error("Error fetching faculties:", error);
        }
    }

    function makeFacultiesDropDownMenu(){
        const facultyDropdown = document.getElementById("faculty_id");
        facultyDropdown.innerHTML = '<option value="">Select Faculty</option>'; // Reset dropdown
        
        faculties.forEach(faculty => {
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
                    <button type="button" onclick="deleteFaculty(event, ${faculty.id})">Delete</button>
                </td>
            `;
            facultyTable.appendChild(row);
        });
    }

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

    // Define deleteFaculty function globally
    window.deleteFaculty = async function (event, id) {
        if (event) {
            event.preventDefault(); // Stop default action
            event.stopPropagation(); // Prevent bubbling
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/faculties/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                faculties = faculties.filter(faculty => faculty.id !== id);
                updateFacultyTable(); // Refresh table dynamically
            } else {
                console.error("Failed to delete faculty.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Fetch faculties on page load
    fetchFaculties();
});

document.addEventListener("DOMContentLoaded", async function () {
    await fetchStudents(); // Fetch and display students on page load
});

// Function to fetch all students and populate the table
async function fetchStudents() {
    try {
        const response = await fetch("http://127.0.0.1:8000/students", {
            method: "GET", // Correctly specify the HTTP method
            headers: {
                "Content-Type": "application/json", // Optional but good practice
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await response.json();
        populateStudentsTable(students);
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

// Function to populate students table
function populateStudentsTable(students) {
    console.log(students)
    const tableBody = document.querySelector("#studentsTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    students.students.forEach(student => {
        let photoPath = student.photo_path;

        // Remove "file:///" from the beginning of the path
        if (photoPath.startsWith(" file:///D:/work/MilitaryService")) {
            photoPath = photoPath.replace(" file:///D:/work/MilitaryService", "");
        }
        console.log(photoPath)
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td><img src=''></td>
            <td>${student.age}</td>
            <td>${student.seq_number}</td>
            <td>${student.faculty_id}</td>
            <td>
                <button onclick="showEditForm(${student.id})">Edit</button>
                <button onclick="redirectToStatisticsPage(${student.id})">Statistics</button>
                <button onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function redirectToStatisticsPage(studentId) {
    window.location.href = `statistics.html?id=${studentId}`;
}

// Function to delete a student
async function deleteStudent(studentId) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/students/${studentId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete student");
        }

        alert("Student deleted successfully!");
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
        .then(response => response.json())
        .then(data => {
            document.getElementById("editName").value = data.name;
            document.getElementById("editAge").value = data.age;
            document.getElementById("editSequence").value = data.seq_number;
            document.getElementById("editUserId").value = data.id; // Store ID for update
        })
        .catch(error => console.error("Error fetching user:", error));
}

function closeEditForm() {
    document.getElementById("editUserForm").style.display = "none";
}

async function updateUser() {
    try {
        const userId = document.getElementById("editUserId").value;
        const updatedName = document.getElementById("editName").value;
        const updatedAge = document.getElementById("editAge").value;
        const updatedSeq = document.getElementById("editSequence").value;

        const response = await fetch(`http://127.0.0.1:8000/students/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: updatedName, age: updatedAge, seq_number: updatedSeq }),
        });

        if (!response.ok) throw new Error(`Failed to update user. Status: ${response.status}`);

        const res = await response.json();
        console.log("Updated User:", res);

        alert("User updated successfully!");
        closeEditForm();
    } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user. Please try again.");
    }
}



