const express = require('express');
const router = express.Router();
const couponcontroller=require('../controllers/couponcontroller')

router.get('/admin/addcoupon',couponcontroller.addcoupon)
router.post('/admin/addcouponpost',couponcontroller.addcouponpost)
router.get('/admin/viewcoupon',couponcontroller.viewcoupon)
router.post('admin/couponcheck',couponcontroller.couponcheck)
router.get('/admin/editcoupon/:id', couponcontroller.editcoupon)
router.post("/admin/editcoupon/:id",couponcontroller.editcouponpost)
router.post('/admin/deletecoupon/:id',couponcontroller.deletecoupon)
module.exports=router 