const express = require('express');
const router = express.Router();
const offercontroller=require('../controllers/offercontroller')


router.get('/admin/viewoffer',offercontroller.viewoffer)
router.get('/admin/addofferproduct',offercontroller.addofferproductGet)
router.post('/admin/addofferproduct',offercontroller.addofferproductPost)
router.get('/admin/addoffercategory',offercontroller.addoffercategoryGet)
router.post('/admin/addoffercategory',offercontroller.addoffercategoryPost)

router.get("/admin/editofferproduct/:id",offercontroller.editofferproductGet)
router.get("/admin/editoffercategory/:id",offercontroller.editoffercategoryGet)



// router.post('/admin/addcouponpost',couponcontroller.addcouponpost)
// router.post('admin/couponcheck',couponcontroller.couponcheck)
// router.get('/admin/editcoupon/:id', couponcontroller.editcoupon)
// router.post("/admin/editcoupon/:id",couponcontroller.editcouponpost)
// router.post('/admin/deletecoupon/:id',couponcontroller.deletecoupon)
module.exports=router 