async function loadFaculties() {
    try {
        const response = await fetch("http://127.0.0.1:8000/faculties/", {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            console.log("Error loading faculties");
            return [];
        }

        const faculties = await response.json();
        return faculties.map(faculty => ({
            value: faculty.id,
            text: faculty.name
        }));
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return [];
    }
}

async function fetchFacultyReport(facultyId, isMale,date) {
    // Construct the URL with parameters
    const url = `http://127.0.0.1:8000/reports/faculty_report/${facultyId}?is_male=${isMale}&start_date=${date}`;

    try {
        // Make the GET request
        const response = await fetch(url);

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "faculty_report.xlsx"; // Default filename
        if (contentDisposition && contentDisposition.includes("filename=")) {
            filename = contentDisposition
                .split("filename=")[1]
                .replace(/['"]/g, ""); // Remove quotes
        }

        // Convert the response to a Blob
        const blob = await response.blob();

        // Trigger a download of the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    } catch (error) {
        // Handle any errors
        console.error("Error fetching faculty report:", error);
        alert("فشل في جلب تقرير الكلية. الرجاء المحاولة مرة أخرى.");
    }
}

async function downloadGeneralReport(isMale , date) {
    try {
        console.log(date, isMale);
        const url = `http://127.0.0.1:8000/reports/general_report?is_male=${isMale}&start_date=${date}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to download the report");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "general_report.xlsx"; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log("Report downloaded successfully!");
    } catch (error) {
        console.error("Error downloading the report:", error);
    }
}
async function fetchDayReport(day, isMale) {
    // Construct the URL with parameters
    const url = `http://127.0.0.1:8000/reports/day_report?is_male=${isMale}&day=${day}`;

    try {
        // Make the GET request
        const response = await fetch(url);

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");

        let filename = "day_report.xlsx"; // Default filename
        if (contentDisposition && contentDisposition.includes("filename=")) {
            filename = contentDisposition
                .split("filename=")[1]
                .replace(/['"]/g, ""); // Remove quotes
        }

        // Convert the response to a Blob
        const blob = await response.blob();

        // Trigger a download of the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    } catch (error) {
        // Handle any errors
        console.error("Error fetching day report:", error);
        alert("فشل في جلب تقرير اليوم. الرجاء المحاولة مرة أخرى.");
    }
}
async function fetchQRCodeReport(isMale) {
    const url = `http://127.0.0.1:8000/reports/qr_code?is_male=${isMale}`;

    try {
        // Make the GET request
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        console.log(response);

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Convert response to a Blob
        const blob = await response.blob();
        console.log(blob);

        // Set static filename
        const filename = "QrCodes.pdf";

        // Trigger a download of the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Error fetching QR code report:", error);
        alert("فشل في جلب تقرير QR code. الرجاء المحاولة مرة أخرى.");
    }
}
