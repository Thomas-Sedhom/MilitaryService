document.addEventListener("DOMContentLoaded", async function () {
  const reportTypeSelect = document.getElementById("reportType");
  const facultySelect = document.getElementById("facultySelect");
  const facultyLabel = document.querySelector("label[for='facultySelect']");
  const reportDateInput = document.getElementById("reportDate");
  const reportDateLabel = document.querySelector("label[for='reportDate']");
  const generateButton = document.getElementById("generateReport");
  const genderRadios = document.querySelectorAll('input[name="startedgender"]');
  let selectedGender = true;
  genderRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      selectedGender = this.value;
    });
  });
  const reports = [
    { value: 0, text: "تقرير يومى" },
    { value: 1, text: "تقرير للكلية" },
    { value: 2, text: "تقرير عام" },
  ];
  // fill the sel
  const facultyOptions = await loadFaculties();
  addOptionsToSelect(reportTypeSelect, reports);
  addOptionsToSelect(facultySelect, facultyOptions);

  // Function to show/hide inputs and labels based on report type selection
  function toggleInputs() {
    const selectedValue = parseInt(reportTypeSelect.value);

    if (selectedValue === 0) {
      // Daily Report → Show Date, Hide Faculty
      reportDateInput.style.display = "block";
      reportDateLabel.style.display = "block";
      facultySelect.style.display = "none";
      facultyLabel.style.display = "none";
    } else if (selectedValue === 1) {
      // Faculty Report → Show Faculty, Hide Date
      reportDateInput.style.display = "block";
      reportDateLabel.style.display = "block";
      facultySelect.style.display = "block";
      facultyLabel.style.display = "block";
    } else {
      // General Report → Hide both
      reportDateInput.style.display = "block";
      reportDateLabel.style.display = "block";
      facultySelect.style.display = "none";
      facultyLabel.style.display = "none";
    }
  }

  // Initial check on page load
  toggleInputs();
  generateButton.addEventListener("click", async function () {
    reporttype = reportTypeSelect.value;
    faculty = facultySelect.value;
    reportdate = reportDateInput.value;

    const genderInput = document.querySelector(
      'input[name="startedgender"]:checked'
    );
    const gender = genderInput ? genderInput.value === "1" : null;
    if (reporttype === "0") {
      if (!reportdate) {
        showNotification(false,"الرجاء اختيار التاريخ لتقرير اليومي.");
        return;
      }

      await fetchDayReport(reportdate, gender);
    } else if (reporttype === "1") {
      if (!faculty) {
        showNotification(false,"الرجاء اختيار الكلية والنوع لتقرير الكلية.");
        return;
      }
      await fetchFacultyReport(faculty, gender,reportdate);
    } else if (reporttype === "2") {
      await downloadGeneralReport(gender,reportdate);
    }

  });
  // Add event listener to toggle inputs when selection changes
  reportTypeSelect.addEventListener("change", toggleInputs);
});
document.querySelectorAll('input[name="startedgender"]').forEach((radio) => {
  radio.addEventListener("change",async function () {
    // console.log("dfasdfas")
    facultyOptions = await loadFaculties( this.value); 
location.reload();

  });
});
