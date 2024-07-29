const mongoose = require('mongoose');

const optionsSchema = {
  type: String,
  required: true,
};

const productSchema = new mongoose.Schema({
  productName: optionsSchema,
  brand: optionsSchema,
  description: optionsSchema,
  category: optionsSchema,
  code: optionsSchema,
  quantity: optionsSchema,
  price: optionsSchema,
  imagePath: optionsSchema,
  barcodePath: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
