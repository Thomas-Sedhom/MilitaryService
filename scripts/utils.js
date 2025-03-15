function addOptionsToSelect(selectElement, options) {
    options.forEach((option) => {
        const newOption = document.createElement("option");
        newOption.value = option.value; // Set the value
        newOption.textContent = option.text; // Set the display text
        selectElement.appendChild(newOption); // Add the option to the select box
    });
}