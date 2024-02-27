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

const otpSchema = new mongoose.Schema({
  email: {
      type: String,
      required: true
  },
  otp: {
      type: String,
      required: true
  },
  createdAt: {
      type: Date,
      default: Date.now,
      expires: 60
  }
});

//Index to enforce expiration
otpSchema.index({ createdAt: 1 }, {expireAfterSeconds: 60});

module.exports = mongoose.model("OTP", otpSchema)