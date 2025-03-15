let confirmResolve; // Stores the resolve function of the promise

// Function to show the confirm box
function showConfirmBox(message) {
    return new Promise((resolve) => {
        confirmResolve = resolve;
        document.getElementById("confirm-message").textContent = message;
        document.getElementById("confirm-box").style.display = "block";
        document.getElementById("confirm-overlay").style.display = "block";
    });
}

// Function to handle button clicks
function confirmAction(choice) {
    document.getElementById("confirm-box").style.display = "none";
    document.getElementById("confirm-overlay").style.display = "none";
    confirmResolve(choice);
}
