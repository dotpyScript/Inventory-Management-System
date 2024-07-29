const express = require('express');
const bwipjs = require('bwip-js');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Product = require('../models/product.schema');
const Category = require('../models/category.schema');
const Sales = require('../models/sales.schema');
const Purchase = require('../models/purchase.schema');

const router = express.Router();
// Define a storage location
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 4000000 }, // 4MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

//////////////////////// Product //////////////////////////

// Route to serve the form
router.get('/page-add-product', async (req, res) => {
  try {
    const purchase = await Purchase.find();
    const { productName, brand, quantity } = req.query;
    res.render('page-add-product', { productName, brand, quantity, purchase });
  } catch (err) {
    console.error(err);
  }
});

router.post('/page-add-product', (req, res) => {
  upload(req, res, async err => {
    if (err) {
      console.error('Error uploading file:', err);
      req.flash('error_msg', 'Error occurred while uploading file');
      return res.redirect('/users/page-add-product');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file selected!');
        return res.redirect('/users/page-add-product');
      } else {
        try {
          const purchase = await Purchase.findOne({
            productName: req.body.productName,
          });

          if (!purchase) {
            req.flash('error_msg', 'No matching purchase found');
            return res.redirect('/users/page-add-product');
          }

          if (req.body.quantity > purchase.quantity) {
            console.log('Quantity in store is insufficient');
            req.flash('error_msg', 'Quantity in store is insufficient');
            return res.redirect('/users/page-add-product');
          } else {
            const remainingQuantity = purchase.quantity - req.body.quantity;
            purchase.quantity = remainingQuantity;
            await purchase.save();
          }

          const newProduct = new Product({
            date: req.body.date,
            productName: req.body.productName,
            brand: req.body.brand,
            description: req.body.description,
            category: req.body.category,
            code: req.body.code,
            price: req.body.price,
            quantity: req.body.quantity,
            imagePath: '/uploads/' + req.file.filename,
          });

          await newProduct.save();

          // Generate barcode
          const barcodeImagePath = path.join(
            __dirname,
            '../public/barcodes',
            `${newProduct._id}.png`
          );
          bwipjs.toBuffer(
            {
              bcid: 'code128', // Barcode type
              text: newProduct._id.toString(), // Text to encode
              scale: 3, // 3x scaling factor
              height: 10, // Bar height, in millimeters
              includetext: true, // Show human-readable text
              textxalign: 'center', // Always good to set this
            },
            function (err, png) {
              if (err) {
                console.error('Error generating barcode:', err);
                req.flash(
                  'error_msg',
                  'Error occurred while generating barcode'
                );
                return res.redirect('/users/page-add-product');
              } else {
                fs.writeFileSync(barcodeImagePath, png);
                newProduct.barcodePath = '/barcodes/' + newProduct._id + '.png';
                newProduct
                  .save()
                  .then(() => {
                    req.flash(
                      'success_msg',
                      'Successfully added product with barcode'
                    );
                    res.redirect('/users/page-add-product');
                  })
                  .catch(err => {
                    console.error('Error saving product with barcode:', err);
                    req.flash(
                      'error_msg',
                      'Error occurred while saving product with barcode'
                    );
                    res.redirect('/users/page-add-product');
                  });
              }
            }
          );
        } catch (err) {
          console.error('Error occurred while adding product:', err);
          req.flash('error_msg', 'Error occurred while adding product');
          res.redirect('/users/page-add-product');
        }
      }
    }
  });
});

// list product
// description: get Request
router.get('/page-list-product', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('page-list-product', { products: products });
  } catch (err) {
    req.flash('error_msg', 'fail to retrieve product');
    res.redirect('/users/index');
  }
});

router.get('/barcode-scanner', (req, res) => {
  res.render('barcode-scanner');
});

// API route to fetch product details by barcode
router.get('/barcode-scanner/:barcode', async (req, res) => {
  try {
    const product = await Product.findById(req.params.barcode);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/// View Product ///
/// description: Get request ////
router.get('/view-product/:id', async (req, res) => {
  try {
    const viewProduct = await Product.findById(req.params.id);
    res.render('view-product', { product: viewProduct });
  } catch (err) {
    req.flash('error_msg', 'fail to view product');
    res.redirect('/users/page-list-product');
  }
});

/// Edit Product ////
/// Description ////

router.get('/edit-product/:id', async (req, res) => {
  try {
    const editProduct = await Product.findById(req.params.id);
    res.render('edit-product', { product: editProduct });
  } catch (err) {
    req.flash('error_msg', 'fail to view product');
    res.redirect('/users/page-list-product');
  }
});

/// Edit Product
/// Description: POST request

router.post('/edit-product/:id', async (req, res) => {
  upload(req, res, async err => {
    if (err) {
      req.flash('error_msg', 'Error Occured');
      return res.redirect('/users/edit-product' + req.params.id);
    } else {
      try {
        // edit a product parameters
        const product = await Product.findById(req.params.id);
        product.name = req.body.name;
        product.category = req.body.category;
        product.description = req.body.description;
        product.code = req.body.code;
        product.price = req.body.price;
        product.quantity = req.body.quantity;

        if (req.file) {
          product.imagePath = '/uplaods/' + req.file.filename;
        }

        // save edited product to mongodb
        await product.save();
        req.flash('success_msg', 'product successfully updated');
        res.render('page-list-product');
      } catch (err) {
        req.flash('error_msg', 'Error while uploading product');
        res.redirect('/users/edit-product' + req.params.id);
      }
    }
  });
});

/// delete product///
/// Description: POST request to find and delete a particuler product ///

router.post('/delete-product/:id', async (req, res) => {
  try {
    // find product from database
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Product deleted successfully');
    res.redirect('/users/page-list-product');
  } catch (err) {
    req.flash('error_msg', 'Fail to delete product');
    res.redirect('/users/page-list-product');
  }
});

/////////////////////// category //////////////////////

// add category
// description: get Request
router.get('/page-add-category', async (req, res) => {
  res.render('page-add-category');
});

// Route to create a new product
router.post('/page-add-category', async (req, res) => {
  upload(req, res, async err => {
    if (err) {
      console.error('Upload error:', err);
      req.flash('error_msg', err);
      return res.redirect('/users/page-add-category');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file selected!');
        return res.redirect('/users/page-add-category');
      } else {
        const newCategory = new Category({
          name: req.body.name,
          imagePath: '/uploads/' + req.file.filename,
        });

        try {
          await newCategory.save();
          req.flash('success_msg', 'Successfully uploaded');
          res.redirect('/users/page-list-category');
        } catch (err) {
          console.error('Save error:', err);
          req.flash('error', 'Failed to upload category.');
          res.redirect('/users/page-add-category');
        }
      }
    }
  });
});

// list category
// description: get Request
router.get('/page-list-category', async (req, res) => {
  try {
    const category = await Category.find();
    res.render('page-list-category', { category: category });
  } catch (err) {
    req.flash('erro_msg', 'fail to retrieve products');
    res.redirect('/users/page-list-category');
  }
});

// add sale
// description: get Request
router.get('/page-list-sale', async (req, res) => {
  try {
    const sales = await Sales.find();
    res.render('page-list-sale', { sales: sales });
  } catch (err) {
    req.flash('error_msg', 'Failed to retrieve sales');
    res.redirect('/users/page-list-sale');
  }
});

// add sale
// description: get Request
router.get('/page-add-sale', (req, res) => {
  res.render('page-add-sale');
});

router.post('/page-add-sale', async (req, res) => {
  upload(req, res, async err => {
    if (err) {
      console.error(`message: Uploading error`);
      req.flash('error_msg', 'error occured while uploading file', err);
      return res.redirect('/users/page-add-sale');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file selected!');
        return res.redirect('/users/page-add-sale');
      } else {
        const newSale = new Sales({
          date: req.body.date,
          reference: req.body.reference,
          biller: req.body.biller,
          customer: req.body.customer,
          orderDiscount: req.body.orderDiscount,
          total: req.body.total,
          paid: req.body.paid,
          address: req.body.address,
          imagePath: '/uploads/' + req.file.filename,
          salesStatus: req.body.salesStatus,
          paymentStatus: req.body.paymentStatus,
        });

        try {
          await newSale.save();
          req.flash('success_msg', 'Succesfull');
          res.redirect('/users/page-add-sale');
        } catch (err) {
          console.log(err);
          req.flash('error_msg', 'error occured while uploading');
          res.redirect('/users/page-add-sale');
        }
      }
    }
  });
});

// get purchase
// description: get Request
router.get('/page-add-purchase', (req, res) => {
  res.render('page-add-purchase');
});

// Function to generate a random custom ID
function generateCustomId() {
  return 'PR' + crypto.randomBytes(4).toString('hex');
}

router.post('/page-add-purchase', async (req, res) => {
  const { date, productName, brand, supplier, cost, quantity } = req.body;

  try {
    // Generate a custom ID for the purchase
    const customId = generateCustomId();

    // Create a new purchase with the generated custom ID
    const newPurchase = new Purchase({
      date,
      productName,
      brand,
      supplier,
      cost,
      quantity,
      customId, // Add the custom ID to the purchase document
    });

    await newPurchase.save();
    req.flash('success_msg', 'Purchase added successfully');
    res.redirect('/users/page-add-purchase');
  } catch (err) {
    console.error('Error occurred:', err);
    req.flash('error_msg', 'Error occurred while adding purchase');
    res.redirect('/users/page-add-purchase');
  }
});

// list purchase
// description: get Request
router.get('/page-list-purchase', async (req, res) => {
  try {
    const purchase = await Purchase.find();
    res.render('page-list-purchase', { purchase: purchase });
  } catch (err) {
    req.flash('error_msg', 'error occured');
    res.redirect('/users/page-list-purchase');
  }
});

module.exports = router;
