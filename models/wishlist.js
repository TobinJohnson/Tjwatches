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

const wishlistSchema = new mongoose.Schema({
    userid: { type: String },
    productid: [{ type: String , ref: 'Product'}]})
    
  const wishlistcollection = mongoose.model("wishlist", wishlistSchema, "wishlist");
  module.exports = wishlistcollection;