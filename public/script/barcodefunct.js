document
  .getElementById('camera-scan-btn')
  .addEventListener('click', function () {
    document.getElementById('file-input').style.display = 'none';
    document.getElementById('scanner-container').style.display = 'block';
    document.getElementById('stop-scan-btn').style.display = 'block';
    initCameraScan();
  });

document.getElementById('stop-scan-btn').addEventListener('click', function () {
  Quagga.stop();
  document.getElementById('scanner-container').style.display = 'none';
  document.getElementById('stop-scan-btn').style.display = 'none';
});

document.getElementById('file-scan-btn').addEventListener('click', function () {
  document.getElementById('scanner-container').style.display = 'none';
  document.getElementById('file-input').style.display = 'block';
});

document
  .getElementById('file-input')
  .addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const html5QrCode = new Html5Qrcode('reader');
      html5QrCode
        .scanFile(file, true)
        .then(decodedText => {
          console.log('QR code detected: ', decodedText);
          fetchProductDetails(decodedText);
        })
        .catch(err => {
          console.error('No QR code detected.', err);
          document.getElementById('result').innerText =
            'No QR code detected. Please try again with a clearer image.';
        });
    }
  });

function initCameraScan() {
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#scanner-container'), // Or '#yourElement' (optional)
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment', // or "user" for the front camera
        },
      },
      decoder: {
        readers: [
          'code_128_reader',
          'ean_reader',
          'ean_8_reader',
          'code_39_reader',
          'code_39_vin_reader',
          'codabar_reader',
          'upc_reader',
          'upc_e_reader',
          'i2of5_reader',
          '2of5_reader',
          'code_93_reader',
        ],
      },
    },
    function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Initialization finished. Ready to start');
      Quagga.start();
    }
  );

  Quagga.onDetected(function (result) {
    var code = result.codeResult.code;
    console.log('Barcode detected and processed : [' + code + ']', result);
    fetchProductDetails(code);
    Quagga.stop(); // Stop scanning after a barcode is detected
    document.getElementById('stop-scan-btn').style.display = 'none';
  });
}

function fetchProductDetails(barcode) {
  fetch(`/users/barcode-scanner/${barcode}`)
    .then(response => response.json())
    .then(data => {
      const productDetailsDiv = document.getElementById('product-details');
      if (data.error) {
        productDetailsDiv.innerHTML = `<p class="text-danger">${data.error}</p>`;
      } else {
        productDetailsDiv.innerHTML = `
                <h3>Product Details</h3>
                <p><strong>Name:</strong> ${data.productName}</p>
                <p><strong>Brand:</strong> ${data.brand}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Price:</strong> ${data.price}</p>
                <p><strong>Quantity:</strong> ${data.quantity}</p>
                <button onclick="addToCart('${data._id}')" class="btn btn-primary">Add to Cart</button>
              `;
      }
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
    });
}

function addToCart(productId) {
  // Handle adding the product to the cart (implementation depends on your cart logic)
  alert(`Product ${productId} added to cart`);
}
