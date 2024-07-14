const mongoose = require('mongoose');

const salesSchema = mongoose.Schema;

const schema = new salesSchema({
  customer: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  discount: {
    type: String,
    require: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paid: {
    type: Number,
    required: true,
  },
  biller: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
