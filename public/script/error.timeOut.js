// JavaScript to dismiss alerts after a timeout
setTimeout(() => {
  const alerts = document.querySelectorAll('.container-content');
  alerts.forEach(alert => {
    alert.classList.remove('show');
    alert.classList.add('fade');
    setTimeout(() => alert.remove(), 150); // Remove the element after the fade-out effect
  });
}, 10000);
// 5000 milliseconds = 5 seconds
