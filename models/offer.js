const mongoose = require('mongoose');
require('dotenv').config()

const productSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
  productName: String
});

const categorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  categoryName: String
});

const offerschema = new mongoose.Schema({
  type: String,
  code: String,
  discount: Number,
  startDate: Date,  
  endDate: Date,
  isActive: { type: Boolean, default: true },
  applicableProducts: [productSchema],
  applicableCategories: [categorySchema]
});

const offer = new mongoose.model('offer', offerschema);

module.exports = offer;
