const mongoose = require('mongoose');
require('dotenv').config()

// mongoose.connect(`mongodb://${process.env.localhost}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => {
//     console.log("mongo connected succesfully");
//   }).catch(error => {
//     console.log(error);
//   })

const cartSchema = new mongoose.Schema({
    userid: { type: String },
    // productid: { type: String },
    products: [{
      productid: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number}]})
    // product: { type: String},

    // price: { type: Number },
    // total: { type: Number },
    // quantity: { type: Number,default:1 },
    // image: [{ type: String }]
  
  
  const cartcollection = mongoose.model("cart", cartSchema, "cart");
  module.exports = cartcollection;