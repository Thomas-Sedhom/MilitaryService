const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get("id"); // Extract 'id' from ?id=1

document.addEventListener("DOMContentLoaded", async () => {
    // Get the ID from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("id"); // Extract 'id' from ?id=1

    if (!studentId) {
        console.error("No student ID found in URL.");
        return;
    }

    try {
        // Fetch student data from API
        const response = await fetch(`http://127.0.0.1:8000/students/${studentId}`, {
            method: "GET", // Correctly specify the HTTP method
            headers: {
                "Content-Type": "application/json", // Optional but good practice
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch student data: ${response.statusText}`);
        }

        const student = await response.json(); // Convert response to JSON
        console.log(student)

        // Populate the student card with fetched data
        document.getElementById("studentId").textContent = student.students.id || "N/A";
        document.getElementById("studentName").textContent = student.students.name || "N/A";
        document.getElementById("studentGrade").textContent = student.students.Grade || "N/A";
        document.getElementById("studentFaculty").textContent = student.students.faculty_name || "N/A";
        document.getElementById("attended_days").textContent = student.students.attended_days;
        document.getElementById("seqNum").textContent = student.students.seq_number;

        // Set the student image if available
        const studentImage = document.getElementById("studentImage");
        if (student.students.photo) {
            studentImage.src = `attendance_system-master (1)/attendance_system-master/${student.students.photo}`;
        } else {
            studentImage.src = "default-avatar.png"; // Set a default image if none exists
        }

    } catch (error) {
        console.error("Error fetching student data:", error);
    }
});

//----------------------------------------------------------------------------------------------------
// user table 
 // Sample student data (Replace with real data from your backend)
 const attendanceRecords = [
    { "entrance_time": "2025-03-11T01:47:06.238835", "leave_time": "2025-03-11T01:49:51.951069" },
    { "entrance_time": "2025-03-11T01:52:45.520023", "leave_time": "2025-03-11T03:28:40.093453" }
];



function formatTime(timeStr) {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

async function generateAttendanceTable() {
    try {
        // Fetch student data from API
        const response = await fetch(`http://127.0.0.1:8000/students/${studentId}`, {
            method: "GET", // Correctly specify the HTTP method
            headers: {
                "Content-Type": "application/json", // Optional but good practice
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch student data: ${response.statusText}`);
        }
    
        const student = await response.json(); // Convert response to JSON
        const tableBody = document.getElementById("attendanceTableBody");
    tableBody.innerHTML = "";

    student.students.attendance_records.forEach((record, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${formatDate(record.entrance_time)}</td>
            <td>${formatTime(record.entrance_time)}</td>
            <td>${formatTime(record.leave_time)}</td>
        `;

        tableBody.appendChild(row);
    });
    
    } catch (error) {
        console.error("Error fetching student data:", error);
    }

}

generateAttendanceTable();