document.addEventListener('DOMContentLoaded', () => {
  const successMsg = document.getElementById('success-msg').value;
  const errorMsg = document.getElementById('error-msg').value;
  const errorsList = document.getElementById('errors-list').value;
  const toastContainer = document.getElementById('toast-container');

  const createToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close">
          </button>
      </div>
    `;
    toastContainer.appendChild(toast);
    new bootstrap.Toast(toast).show();
  };

  if (successMsg) {
    createToast(successMsg, 'success');
  }

  if (errorMsg) {
    createToast(errorMsg, 'danger');
  }

  if (errorsList) {
    const errors = JSON.parse(errorsList);
    errors.forEach(error => {
      createToast(error.msg, 'danger');
    });
  }
});
