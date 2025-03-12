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
let selectedGender = 1;

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
            const sequence = row.children[2].textContent;
            const faculty = row.children[3].textContent;

            const matchesName = name.includes(nameValue);
            console.log(sequenceValue)
            const matchesSequence = sequenceValue === "" || sequence.includes(sequenceValue);
            const matchesFaculty = facultyValue === "" || faculty.includes(facultyValue);

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
// load current section
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

document.getElementById("submitUserForm").addEventListener("click", async function () {

    // Get input values
    const name = document.getElementById("name").value;
    const phone_number = document.getElementById("phone_number").value;
    const grade = document.getElementById("grade").value;
    const seqNumber = document.getElementById("seqNumber").value;
    const facultyId = document.getElementById("faculty_id").value;
    const national_id = document.getElementById("national_id").value;

    let gender = document.querySelector('input[name="gender"]:checked').value;

    const photoCanvas = document.getElementById("photoCanvas");
    const photoBase64 = photoCanvas.toDataURL("image/png"); // ✅ Define it here
    console.log(photoBase64); // ✅ Now it will not be undefined

    const photoFile = dataURLToFile(photoBase64, "photo.png");

        if(gender == 'male'){
            gender = true;
            console.log(gender)
        }else{
            gender = false;
            console.log(gender);
        }
        const formData = new FormData();
        formData.append("photo", photoFile); 
        formData.append("name", name);
        formData.append("grade", grade); 
        formData.append("phone_number", phone_number);
        formData.append("faculty_id", facultyId);
        formData.append("is_male", gender); 
        formData.append("photo", photoFile); 
        formData.append("seq_number", seqNumber); 
        formData.append("national_id", national_id); 

        const response = await fetch(`http://127.0.0.1:8000/students/`, {
            method: "POST",
            body:formData,
        });

        const res = await response.json();
        if(res.message != "Student created successfully"){
            console.log(res);
            alert(res.detail);
            return;
        }

        alert("Student saved successfully!");

});
console.log(document.getElementById("saveFaculty"))
document.getElementById("saveFaculty").addEventListener("click", async function () {
    const facultyName = document.getElementById("facultyName").value;
    try {
        const response = await fetch(`http://127.0.0.1:8000/faculties/`, {
            method: "POST",
            headers: {
                "Accept": "application/json",   
                "Content-Type": "application/json"  
            },
            body: JSON.stringify({
                name: facultyName
            })
        });

        alert("Faculty saved successfully!");
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
let scanning = false;

async function startScanner() {
    if (scanning) return; // Prevent multiple calls
    scanning = true;

    // Access Camera
    try {
        const video = document.getElementById("qrScanner");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            scanFrame(); // Start scanning once video is ready
        };
    } catch (error) {
        console.error("Camera access error:", error);
    }
}

async function scanFrame() {
    if (!scanning) return;

    const video = document.getElementById("qrScanner");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame);
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        scanning = false; // Stop scanning after detecting a QR code
        fetchUserData(qrCode.data.split('.')[1]);
    } else {
        requestAnimationFrame(scanFrame); // Continue scanning
    }
}

// Automatically start scanner when page loads
window.addEventListener("load", startScanner);
async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/students/${userId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("User not found");
        }
        const user = await response.json();
        console.log(user)

        // Update user card
        document.getElementById("userId").innerText = user.students.id;
        document.getElementById("userName").innerText = user.students.name;
        document.getElementById("userGrade").innerText = user.students.Grade;
        document.getElementById("userFaculty").innerText = user.students.faculty_id;
        document.getElementById("userSeq").innerText = user.students.seq_number;

        console.log(`attendance_system-master (1)/attendance_system-master/${user.students.photo}`)
        document.getElementById("userImage").src = `attendance_system-master (1)/attendance_system-master/${user.students.photo}`
        console.log(user)
        document.getElementById("notice").value = user.students.notes

        // Enable buttons
        document.getElementById("approveBtn").disabled = false;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}
function refreshPage() {
    console.log(40)
    location.reload(); // Reloads the current page
}
async function approve() {
    const id = document.getElementById("userId").innerText.trim();
    const notes = encodeURIComponent(document.getElementById("notice").value.trim());


    if (!id) {
        console.error("User ID is missing.");
        return;
    }

        console.log(notes)
        const url = `http://127.0.0.1:8000/students/${id}/entrance?notes=${notes}`;

        const response = await fetch(url, {
            method: "POST", // Method must match FastAPI
            headers: {
                "Accept": "application/json"
            },
            credentials: "include"
        });
        
        const res = await response.json();
        if (res.status != 200) {
            alert(res.detail);
            refreshPage()
            return
        }
        alert("Request approved successfully!");
}


let scanningLeave = false;

document.addEventListener("DOMContentLoaded", () => {
    startScannerLeave();
});
async function startScannerLeave() {
    if (scanningLeave) return; // Prevent multiple starts
    scanningLeave = true;

    const video = document.getElementById("qrScannerLeave");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play(); 
            scanFrameLeave();
        };
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

async function scanFrameLeave() {
    if (!scanningLeave) return;

    const video = document.getElementById("qrScannerLeave");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (video.readyState < 2) { 
        requestAnimationFrame(scanFrameLeave);
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
        scanningLeave = false; // Stop scanning after detecting a QR code
        fetchLeaveUserData(qrCode.data.split('.')[1]);
        document.getElementById("approveBtnLeave").disabled = false;
    } else {
        requestAnimationFrame(scanFrameLeave);
    }
}

async function fetchLeaveUserData(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/students/${userId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("User not found");
        }
        const user = await response.json();
        console.log(user)

        // Update user card
        document.getElementById("userIdLeave").innerText = user.students.id;
        document.getElementById("userNameLeave").innerText = user.students.name;
        document.getElementById("userGradeLeave").innerText = user.students.Grade;
        document.getElementById("userFacultyLeave").innerText = user.students.faculty_id;
        document.getElementById("userSeqLeave").innerText = user.students.seq_number;
        document.getElementById("userImageLeave").src = `attendance_system-master (1)/attendance_system-master/${user.students.photo}`
        document.getElementById("noticeLeave").value = user.students.notes
        // Enable buttons
        document.getElementById("approveBtn").disabled = false;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

async function approveLeave() {
    const id = document.getElementById("userId").innerText.trim();
    const notes = document.getElementById("noticeLeave").value.trim();

    if (!id) {
        console.error("User ID is missing.");
        return;
    }

        console.log(notes);
        const url = `http://127.0.0.1:8000/attendance/${id}/leave?notes=${encodeURIComponent(notes)}`;

        const response = await fetch(url, {
            method: "PUT", 
            headers: {
                "Accept": "application/json"
            }
        });
        const res = await response.json();
        if (res.status != 200) {
            alert(res.detail);
        }
        alert("Request approved successfully!");

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
fetchStudents(); // Fetch students when the page loads

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");

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
    showSection(lastSection)
    let students = [];

 
    
    document.getElementById("studentForm").addEventListener("submit", function (event) {
        event.preventDefault();
        addStudent();
    });
    
    // Fetch students from API
    // async function fetchStudents() {
    //     try {
    //         const response = await fetch(
    //             "http://127.0.0.1:8000/students",{
    //                 method: "GET"
    //             }
    //         );
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    
    //         students = await response.json(); // Assuming API returns an array of students
    //         // console.log(students, 5555)
    //         updateStudentTable();
    //     } catch (error) {
    //         console.error("Error fetching students:", error);
    //     }
    // }
    
    // // Add a new student
    // async function addStudent() {
    //     let student = {
    //         name: document.getElementById("name").value,
    //         grade: document.getElementById("grade").value,
    //         seqNumber: document.getElementById("seqNumber").value,
    //         faculty_name: document.getElementById("faculty_name").value,
    //         attended_days: 0
    //     };
    
    //     try {
    //         const response = await fetch("http://127.0.0.1:8000/students", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(student),
    //         });
    
    //         if (!response.ok) {
    //             throw new Error(`Failed to add student. Status: ${response.status}`);
    //         }
    
    //         // After successfully adding, fetch the updated student list
    //         fetchStudents();
    //         document.getElementById("studentForm").reset();
    //     } catch (error) {
    //         console.error("Error adding student:", error);
    //     }
    // }

    window.editStudent = function (index) {
        let student = students[index];

        document.getElementById("name").value = student.name;
        document.getElementById("grade").value = student.age;
        document.getElementById("seqNumber").value = student.seqNumber;
        document.getElementById("faculty_id").value = student.faculty_id;

        students.splice(index, 1);
        populateStudentsTable();
    };

    // window.deleteStudent = function (index) {
    //     students.splice(index, 1);
    //     populateStudentsTable(students);
    // };
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

        // // Remove "file:///" from the beginning of the path
        // if (photoPath.startsWith(" file:///D:/work/MilitaryService")) {
        //     photoPath = photoPath.replace(" file:///D:/work/MilitaryService", "");
        // }
        // console.log(photoPath)
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.Grade}</td>
            <td>${student.seq_number}</td>
            <td>${student.faculty_name}</td>
            <td>${student.notes !== undefined ? student.notes : '-'}</td>
            <td>
                <button onclick="showEditForm(${student.id})">Edit</button>
                <button onclick="redirectToStatisticsPage(${student.id})">Statistics</button>
                <button onclick="deleteStudent(${student.id})">Delete</button>
                <button onclick="showUpdateImageForm(${student.id})">Update Image</button>
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
            document.getElementById("editName").value = data.students.name;
            document.getElementById("editGrade").value = data.students.Grade;
            document.getElementById("editSequence").value = data.students.seq_number;
            document.getElementById("editNotes").value = data.students.notes;
            document.getElementById("editUserId").value = data.students.id; // Store ID for update
        })
        .catch(error => console.error("Error fetching user:", error));
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
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Error accessing camera:", err));
}

function closeUpdateImageForm() {
    document.getElementById("updateImageForm").style.display = "none";
    const video = document.getElementById("updateCamera");
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop()); // Stop the camera stream
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
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
document.getElementById("uploadImageButton").addEventListener("click", uploadUpdatedImage);

async function uploadUpdatedImage(event) {
    console.log(event)
    event.preventDefault(); // Prevent form submission and page refresh

    try {
        const userId = document.getElementById("updateUserId").value;
        const canvas = document.getElementById("updatePhotoCanvas");
        const photoBase64 = canvas.toDataURL("image/png");

        if (!photoBase64) {
            alert("Please capture an image before uploading.");
            return;
        }

        const photoFile = dataURLToFile(photoBase64, "updated_photo.png");

        const formData = new FormData();
        formData.append("photo", photoFile);

        const response = await fetch(`http://127.0.0.1:8000/students/${userId}/photo`, {
            method: "PUT",
            body: formData,
        });

        console.log(response)

        if (response.status != 200) throw new Error(`Failed to upload image. Status: ${response.status}`);

        alert("Image updated successfully!");

    } catch (error) {
        console.error("Error updating image:", error);
        alert("Failed to update image. Please try again.");
    }
}



async function updateUser() {
    try {
        const userId = document.getElementById("editUserId").value;
        const updatedName = document.getElementById("editName").value;
        const updatedGrade = document.getElementById("editGrade").value;
        const updateNotes = document.getElementById("editNotes").value;
        const updatedSeq = document.getElementById("editSequence").value;
        const queryParams = new URLSearchParams({
            name: updatedName,
            grade: updatedGrade,
            seqNumber: updatedSeq,
            notes: updateNotes
        }).toString();
        const response = await fetch(`http://127.0.0.1:8000/students/${userId}/data?${queryParams}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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
//--------------------------------------------------------------------------------------------------
// Upload excel sheet 
document.addEventListener("DOMContentLoaded", () => {
    const facultyDropdown = document.getElementById("sheetFacultyId");
    const fileInput = document.getElementById("excelFile");
    const form = document.getElementById("bulkUploadForm");

    // Function to fetch faculties
    async function loadFaculties() {
        try {
            const response = await fetch("http://127.0.0.1:8000/faculties");
            const faculties = await response.json();

            facultyDropdown.innerHTML = '<option value="">Select Faculty</option>'; // Reset options

            faculties.forEach(faculty => {
                const option = document.createElement("option");
                option.value = faculty.id;
                option.textContent = faculty.name;
                facultyDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching faculties:", error);
            facultyDropdown.innerHTML = '<option value="">Failed to load faculties</option>';
        }
    }

    // Call function to load faculties
    loadFaculties();

    // Handle Form Submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const filePathInput = document.getElementById("filePath");
        file = filePathInput.files[0]; // Get the selected file
        filePathInput.addEventListener("change", function (event) {
            file = filePathInput.files[0]; // Get the selected file
            if (file) {
                console.log("Selected file:", file.name);
            } else {
                console.log("No file selected");
            }
        });
        const facultyId = facultyDropdown.value;
        const isMale = gender.value === "male"; // Convert string to boolean

        if (!filePathInput || !facultyId) {
            alert("Please fill all fields before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("faculty_id", facultyId);
        formData.append("is_male", isMale);

        console.log(file,facultyId, isMale )
        try {
            const response = await fetch("http://127.0.0.1:8000/students/sheet", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                alert("File uploaded successfully!");
                form.reset();
            } else {
                const errorData = await response.json();
                alert("Upload failed: " + errorData);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file.");
        }
    });
});

document.getElementById("resetButton").addEventListener("click", async function () {
    const confirmReset = confirm("Are you sure you want to reset all data?");
    if (!confirmReset) return;
    console.log(selectedGender)
    try {
        const response = await fetch(`http://127.0.0.1:8000/metadata/reset?is_male=${selectedGender}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            alert("Data has been reset successfully!");
        } else {
            alert("Failed to reset data.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error occurred while resetting data.");
    }
});