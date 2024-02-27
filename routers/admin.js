const express=require("express");
const mongoose=require("mongoose");
const router =express.Router();
const db = require('../models/products');
const dbuser = require('../models/user');
const dbadmin=require('../models/admindetails');
const app=express();
const path=require("path")
const orderDb=require('../models/orderDb')

// const upload=require("../multerSetup")
const admincontroller=require("../controllers/admincontroller")

app.use(express.json());
app.use(express.urlencoded({ extended:false }));


const checkSession = (req, res, next) => {
  if (req.session.adminUser) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};
//checking email regex
function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}


const multer = require("multer");

 let storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    filename:function(req,file,cb){
        let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    
        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})
const upload = multer({storage:storage}).array("image",4); 


router.get('/login',admincontroller.loginGet);
router.post('/login',admincontroller.loginPost)
router.get('/dashboard',checkSession,admincontroller.dashboardGet)
router.get('/deleteUser/:id', checkSession,admincontroller.deleteUserGet);
router.get('/updateUser/:id',checkSession,admincontroller.userUpdateGet);
router.get('/product',admincontroller.productGet);
router.get('/addproduct',checkSession,admincontroller.addproductGet);
// router.post('/addproduct',uploads, admincontroller.addProductPost);  
router.post('/addproduct',upload, admincontroller.addProductPost);  

router.get('/category',checkSession, admincontroller.viewcategory);
router.get('/categoryadding', checkSession,admincontroller.categoryadding);
router.post('/categoryadding', admincontroller.categoryaddpost)
router.post('/category', admincontroller.addCategoryPost);
router.get('/updatecategory/:id',checkSession,admincontroller.categoryupdateget)
router.post('/updatecategory/:id',admincontroller.categoryupdatepost)
router.get('/deletecategory/:id',checkSession,admincontroller.deletecategory)
router.get('/edituser', checkSession,admincontroller.editUserGet);
router.get('/updateProduct/:id',admincontroller.updateProductGet);
// router.post('/updateProduct/:id',uploads,admincontroller.updateProductPost);
router.post('/updateProduct/:id',admincontroller.updateProductPost);

router.get('/adminLogout',admincontroller.adminLogoutGet);
router.get('/orderdetails',admincontroller.orderDetails)
router.get('/excelReport',admincontroller.excelReport)
router.get('/salesgeneratepdf',admincontroller.salesPdf)
router.get("/salesReport",admincontroller.salesReport)

router.post('/updateOrderStatus/:orderId', admincontroller.updateOrderStatus);

module.exports = router;