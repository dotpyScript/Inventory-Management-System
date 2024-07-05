document.addEventListener("DOMContentLoaded", function () {
  const studentRecordsTable = document
    .getElementById("records-table")
    .querySelector("tbody");

  const html5QrCode = new Html5Qrcode("qr-reader");

  function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code scanned: ${decodedText}`);

    // Extract data from URL
    const url = new URL(decodedText);
    const regNo = url.searchParams.get("r");

    if (regNo) {
      // Fetch student data from the server
      fetch(`/api/student/${regNo}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            Swal.fire(
              "User Exist",
              "This student is already registered.",
              "warning"
            );
          } else {
            Swal.fire("Success", "Student data saved successfully.", "success");
            addRecordToTable(data.student, "Success");
          }
        })
        .catch((error) => {
          console.error("Error fetching student data:", error);
          addRecordToTable({ regNo }, "Rejected");
        });
    } else {
      Swal.fire("Error", "Invalid QR code format.", "error");
    }
  }

  function addRecordToTable(student, status) {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${student.name || "N/A"}</td>
            <td>${student.regNo || "N/A"}</td>
            <td>${student.department || "N/A"}</td>
            <td>${student.faculty || "N/A"}</td>
            <td>${student.level || "N/A"}</td>
            <td>${status}</td>
        `;

    studentRecordsTable.appendChild(row);
  }

  html5QrCode
    .start(
      { facingMode: "environment" },
      {
        fps: 10, // Optional, frame per seconds for qr code scanning
        qrbox: 250, // Optional, if you want bounded box UI
      },
      onScanSuccess,
      (errorMessage) => {
        console.error(errorMessage);
      }
    )
    .catch((err) => {
      console.error(`Unable to start scanning, error: ${err}`);
    });
});
