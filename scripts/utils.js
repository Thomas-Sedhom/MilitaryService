function addOptionsToSelect(selectElement, options) {
    if (!(selectElement instanceof HTMLSelectElement)) {
        console.error("Provided element is not a <select> element:", selectElement);
        return;
    }

    // Clear existing options
    selectElement.innerHTML = ""; 

    options.forEach((option) => {
        const newOption = document.createElement("option");
        newOption.value = option.value; // Set the value
        newOption.textContent = option.text; // Set the display text
        selectElement.appendChild(newOption); // Add the option to the select box
    });
}
