const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/product.schema');
const Category = require('../models/category.schema');

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
router.get('/page-add-product', (req, res) => {
  res.render('page-add-product');
});

// Route to create a new product
router.post('/page-add-product', (req, res) => {
  upload(req, res, async err => {
    if (err) {
      req.flash('error_msg', err);
      return res.redirect('/users/page-add-product');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file selected!');
        return res.redirect('/users/page-add-product');
      } else {
        const newProduct = new Product({
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          code: req.body.code,
          price: req.body.price,
          cost: req.body.cost,
          quantity: req.body.quantity,
          imagePath: '/uploads/' + req.file.filename,
        });

        try {
          await newProduct.save();
          req.flash('success_msg', 'Successfully uploaded');
          res.redirect('/users/page-add-product');
        } catch (err) {
          req.flash('error', 'Failed to upload product.');
          res.redirect(`/users/page-add-product ${err}`);
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
        product.cost = req.body.cost;
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

module.exports = router;
