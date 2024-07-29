const mongoose = require('mongoose');

const purchase = mongoose.Schema;

const schemaOptions = {
  type: String,
  required: true,
};

const purchaseSchema = new purchase({
  date: {
    type: Date,
    required: true,
  },
  productName: schemaOptions,
  brand: schemaOptions,
  supplier: schemaOptions,
  cost: schemaOptions,
  quantity: schemaOptions,
  customId: {
    type: String,
    required: true,
    unique: true, // Ensure customId is unique
  },
});

module.exports = mongoose.model('Purchase', purchaseSchema);
