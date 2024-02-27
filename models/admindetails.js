const mongoose = require('mongoose');
// require('dotenv').config()
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

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});
const collectionadmin = new mongoose.model("admindetails", adminSchema)

module.exports = collectionadmin