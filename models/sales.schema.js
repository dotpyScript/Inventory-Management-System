const mongoose = require('mongoose');

const schema = mongoose.Schema;

const salesSchema = new schema({
  date: {
    type: Date,
    default: Date.now,
  },
  reference: {
    type: String,
    require: true,
  },
  biller: {
    type: String,
  },
  customer: {
    type: String,
    required: true,
  },
  orderDiscount: {
    type: String,
    require: true,
  },

  total: {
    type: String,
    require: true,
  },
  paid: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  salesStatus: {
    type: String,
    required: true,
  },

  paymentStatus: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Sales', salesSchema);
