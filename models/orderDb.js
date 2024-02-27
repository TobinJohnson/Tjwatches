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
  
  const orderSchema = new mongoose.Schema({
  userId: { type: String },
  username: { type: String },
  products: [{
    productid: { type: String },
    product: { type: String },
    brand: { type: String },
    category: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    status: { type: String },
  }],
  totalQuantity: { type: Number },
  totalPrice: { type: Number },
  address: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: Number },
    cancellationReason: {type:String},

  },
  orderDate: { type: Date },
  paymentMethod:{type:String},
  deliveryDate: { type: Date },
  status:{type:String,default:"Confirmed"}
});

const OrderDb = mongoose.model("productOrder", orderSchema, "productOrder");
module.exports = OrderDb;