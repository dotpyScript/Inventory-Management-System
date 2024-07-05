// const errorMessage = document.getElementById("alert-tag");

// const errorAlert = `
//   <div class="alert alert-warning" role="alert">
//     <div class="iq-alert-icon">
//       <i class="ri-alert-line"></i>
//     </div>
//     <div class="iq-alert-text">
//       A simple <b>warning</b> alert—check it out!
//     </div>
//   </div>
// `;

// const successAlert = `
//   <div class="alert alert-success" role="alert">
//     <div class="iq-alert-icon">
//       <i class="ri-alert-line"></i>
//     </div>
//     <div class="iq-alert-text">
//       A simple <b>success</b> alert—check it out!
//     </div>
//   </div>
// )
// `;

document.addEventListener("DOMContentLoaded", () => {
  const success_msg = document.getElementById("success-msg");
  const error_msg = document.getElementById("error-msg");
  const errors_list = document.getElementById("errors-list");

  const alertContainer = document.getElementById("alert-tag");

  if (success_msg && success_msg.value) {
    const successAlert = `
      <div class="alert alert-success" role="alert">
        <div class="iq-alert-icon">
          <i class="ri-alert-line"></i>
        </div>
        <div class="iq-alert-text">
          ${success_msg.value}
        </div>
      </div>
    `;
    alertContainer.innerHTML = successAlert;
  }

  if (error_msg && error_msg.value) {
    const errorAlert = `
      <div class="alert alert-danger" role="alert">
        <div class="iq-alert-icon">
          <i class="ri-alert-line"></i>
        </div>
        <div class="iq-alert-text">
          ${error_msg.value}
        </div>
      </div>
    `;
    alertContainer.innerHTML = errorAlert;
  }

  if (errors_list && errors_list.value) {
    const errors = JSON.parse(errors_list.value);
    const errorAlert = `
      <div class="alert alert-danger" role="alert">
        <div class="iq-alert-icon">
          <i class="ri-alert-line"></i>
        </div>
        <div class="iq-alert-text">
          <ul>
            ${errors.map((error) => `<li>${error.msg}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
    alertContainer.innerHTML = errorAlert;
  }
});

/*
<!-- Display flash messages -->
                      <div id="alert-tag"></div>
                      <!-- <% if (success_msg) { %>
                        <div class="alert alert-success">
                          <%= success_msg %>
                        </div>
                        <% } %>
                          <% if (error_msg) { %>
                            <div class="alert alert-danger">
                              <%= error_msg %>
                            </div>
                            <% } %>
                              <% if (errors && errors.length> 0) { %>
                                <div class="alert alert-danger">
                                  <ul>
                                    <% errors.forEach(function(error) { %>
                                      <li>
                                        <%= error.msg %>
                                      </li>
                                      <% }); %>
                                  </ul>
                                </div>
                                <% } %> -->
*/
