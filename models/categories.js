const mongoose = require('mongoose');require('dotenv').config()

// mongoose.connect(`mongodb://${process.env.localhost}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => {
//     console.log("mongo connected succesfully");
//   }).catch(error => {
//     console.log(error);
//   })


const categorySchema = new mongoose.Schema({
  categoryname: {
    type: String,
  },
  isListed: { type: Boolean, default: true },
  OfferApplied:{type: Boolean, default: false },
  OfferPercentage:{type: Number, default: 0 }
  
});
const collectioncategory = new mongoose.model("categories", categorySchema)

module.exports = collectioncategory