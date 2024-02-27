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


const userSchema = new mongoose.Schema({
    firstname: {
        type: String, 
      },
    lastname: {
    type: String,
  },
  email: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  password: {
    type: String,
  },
  phone: {
    type: Number,
  },
  address: [{
    housename:String,
    streetname:String,
    postoffice:String,
    city:String,
    state:String,
    pincode:String,
  }],
  
  isBlocked:{
    type:Boolean,
    default:false
  },
  OTP:{
    type:Number,
  },
  Wallet:{
    type:Number,
    default:0
  },
  WalletBalance:[{
  type:String,
  }],
  WalletUpdates:[{
    type:String,
  }]
  
  // collection: collectionName
});
const collectionuser = new mongoose.model("userdb", userSchema,"userdb")

module.exports = collectionuser