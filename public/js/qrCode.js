import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

async function scanQRCode() {
  const qrCodeFile = document.getElementById('qrCodeFile').files[0];
  const reader = new FileReader();

  reader.onload = async event => {
    const qrCodeData = event.target.result.split(',')[1]; // Extract base64 part
    try {
      const response = await fetch('/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `qrCodeData=${encodeURIComponent(qrCodeData)}`,
      });
      const message = await response.text();
      alert(message);
      location.reload(); // Reload page to update results
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert('Error scanning QR code');
    }
  };

  if (qrCodeFile) {
    reader.readAsDataURL(qrCodeFile);
  } else {
    alert('Please select a file to scan');
  }
}

let html5QrCode;
let cameraId;

async function startScanner() {
  const cameraSelect = document.getElementById('cameraSelect');
  if (cameraSelect.length === 0) {
    await Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.text = device.label;
            cameraSelect.appendChild(option);
          });
        }
      })
      .catch(err => {
        console.error('Error getting cameras:', err);
      });
  }

  cameraId = cameraSelect.value;
  html5QrCode = new Html5Qrcode('reader');
  html5QrCode
    .start(
      cameraId,
      {
        fps: 10, // Optional, frame per seconds for qr code scanning
        qrbox: { width: 250, height: 250 }, // Optional, if you want bounded box UI
      },
      (decodedText, decodedResult) => {
        // Handle decoded QR code
        handleQRCode(decodedText);
      },
      errorMessage => {
        // Parse error, ignore it.
      }
    )
    .catch(err => {
      console.error('Unable to start scanning:', err);
    });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        html5QrCode.clear();
      })
      .catch(err => {
        console.error('Error stopping scanner:', err);
      });
  }
}

async function handleQRCode(decodedText) {
  try {
    const response = await fetch('/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `qrCodeData=${encodeURIComponent(decodedText)}`,
    });
    const message = await response.text();
    alert(message);
    location.reload(); // Reload page to update results
  } catch (error) {
    console.error('Error handling QR code:', error);
    alert('Error handling QR code');
  }
}

window.scanQRCode = scanQRCode;
window.startScanner = startScanner;
window.stopScanner = stopScanner;
