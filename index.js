const express=require("express");
const app = express();
const morgan = require("morgan");
const dotenv=require("dotenv");
const nocache = require("nocache");
//const bodyparser = require("body-parser")
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const port = process.env.port || 3000;
const productRoutes = require('./routers/product');
const couponRoute=require('./routers/coupon');
const offerRoute=require('./routers/offer');

const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");
const multerRoute = require('./multerSetup')

require('dotenv').config()
const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(`mongodb://${process.env.localhost}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("mongo connected succesfully");
  }).catch(error => {
    console.log(error);
  })
app.use(morgan('tiny'))

const path=require("path");

//const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended:true }));


app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

//load assets
app.use('/css',express.static(path.resolve(__dirname,"/css")));``
app.use('/img',express.static(path.resolve(__dirname,"/img")));
app.use('/js',express.static(path.resolve(__dirname,"/js")));

app.use(express.static(path.join(__dirname,"public")));
app.use('/uploads',express.static("uploads"));``

app.use(nocache())
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized :true
  }));

app.use('/api', productRoutes);
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/coupon",couponRoute)
app.use("/offer",offerRoute)

app.use("/error", (req,res,)=>{
    res.render('admin/error');
    
});
app.get('*', (req, res) => {
  // Render the error.ejs template from the views/admin folder
  res.status(404).render('admin/error', { errorCode: 404 });
});
// app.use(function(req, res, next) {
//   next(createError(404)); 
// }); 
// app.use(function(err, req, res, next) {

//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);   
//   res.render('admin/error');
// }); 
//Mutler code
// app.post('/upload', (req, res) => {
//   upload(req, res, function(err) {
//       if (err instanceof multer.MulterError) {
//           // A multer error occurred when uploading
//           return res.status(500).json({ error: err.message });
//       } else if (err) {
//           // An unknown error occurred
//           return res.status(500).json({ error: 'Something went wrong!' });
//       }

//       // File uploaded successfully
//       return res.status(200).send('File uploaded!');
//   });
// });
app.listen(3000,() => {
    console.log(`listening to port localhost:${process.env.PORT}`);});
// app.listen(process.env.PORT,() => {
//     console.log(`listening to port localhost:${process.env.PORT}`);});
