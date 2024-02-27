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

// const collectionName = "products";

const productSchema = new mongoose.Schema({
    category: {
        type: String, 
      },
    description: {
    type: String,
  },
  images: [String],

  name: {
    type: String,
  },
  price: {
    type: Number,
  },
offerprice:{
  type:Number,
  default:0,
},
  brand: {
    type: String,
  },
  size: {
    type: String,
  }, 
  dialshape: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  isDeleted :{
    type: Boolean,
    default:false
  },
//   collection: collectionName
});
const collection = new mongoose.model("products", productSchema)

module.exports = collection
