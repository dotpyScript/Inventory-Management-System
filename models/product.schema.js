const mongoose = require('mongoose');

const optionsSchema = {
  type: String,
  required: true,
};

const productSchema = new mongoose.Schema({
  name: optionsSchema,
  description: optionsSchema,
  category: optionsSchema,
  code: optionsSchema,
  quantity: optionsSchema,
  price: optionsSchema,
  cost: optionsSchema,
  imagePath: optionsSchema,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
