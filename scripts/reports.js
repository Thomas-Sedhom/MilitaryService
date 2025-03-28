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
    { value: 3, text: "Qr Codes" },
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
      reportDateInput.style.display = "none";
      reportDateLabel.style.display = "none";
      facultySelect.style.display = "block";
      facultyLabel.style.display = "block";
    } else if (selectedValue === 2) {
      // General Report → Hide both
      reportDateInput.style.display = "none";
      reportDateLabel.style.display = "none";
      facultySelect.style.display = "none";
      facultyLabel.style.display = "none";
    } else {
      reportDateInput.style.display = "none";
      reportDateLabel.style.display = "none";
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

    gender = selectedGender == 1 ? true : false;
    console.log(gender);
    if (reporttype === "0") {
      if (!reportdate) {
        alert("الرجاء اختيار التاريخ لتقرير اليومي.");
        return;
      }

      await fetchDayReport(reportdate, gender);
    } else if (reporttype === "1") {
      if (!faculty) {
        alert("الرجاء اختيار الكلية والنوع لتقرير الكلية.");
        return;
      }
      await fetchFacultyReport(faculty, gender);
    } else if (reporttype === "2") {
      await downloadGeneralReport(gender);
    } else {
      await fetchQRCodeReport(gender);
    }

    console.log("Generate button clicked");
  });
  // Add event listener to toggle inputs when selection changes
  reportTypeSelect.addEventListener("change", toggleInputs);
});
