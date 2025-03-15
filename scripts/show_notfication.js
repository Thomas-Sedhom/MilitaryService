function showNotification(isSuccess, message) {
    const notificationBox = document.getElementById('notification-box');
  
    // Clear previous content and classes
    notificationBox.textContent = '';
    notificationBox.classList.remove('success', 'failure');
  
    // Set message and theme based on the boolean
    if (isSuccess) {
      notificationBox.classList.add('success');
    } else {
      notificationBox.classList.add('failure');
    }
  
    notificationBox.textContent = message;
  
    // Slide in animation
    notificationBox.style.animation = 'slideIn 0.5s forwards';
  
    // Slide out after 3 seconds
    setTimeout(() => {
      notificationBox.style.animation = 'slideOut 0.5s forwards';
    }, 3000);
  }