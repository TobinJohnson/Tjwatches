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

const couponschema=new mongoose.Schema({
    couponcode:{
        type:String
    },
    discount:{
        type:Number
    },
    expiredate:{
        type:Date
    },
    purchaseamount:{
        type:Number
    }
 
})
const couponstructure=new mongoose.model('coupons',couponschema)

module.exports=couponstructure