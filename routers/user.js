const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const app = express();
const db = require("../models/products");
const users = require("../models/user");
const orderDb = require("../models/orderDb");
// const Razorpay = require("razorpay");

const Cart = require("../models/cartSchema");
const wishlistDb = require("../models/wishlist")
const couponDb = require("../models/coupon")
const usercontroller = require("../controllers/usercontroller");
const razorPayment = require("../controllers/paymentcontroller");
const bodyParser = require("body-parser");
const session = require("express-session");
const OrderDb = require("../models/orderDb");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const checkSessionAndBlocked = async(req, res, next) => {
    console.log("Checked sessions");
    if (req.session.user) {
        const userDetials = await users.findOne({ email: req.session.user });
        if (!userDetials.isBlocked) {
            next();
        } else {
            req.session.destroy((err) => {
                if (err) {
                    console.log("Error destroying session: ", err);
                    res.redirect("/user/login");
                } else {
                    res.redirect("/user/login");
                }
            });
        }
    } else {
        res.redirect("/user/login");
    }
};
router.get("/user/login", usercontroller.loginGet);
router.post("/user/login", usercontroller.loginPost);
router.get("/user/signup", usercontroller.signupGet);
router.get("/home", checkSessionAndBlocked, usercontroller.homeGet);
router.get("/profile", usercontroller.profilePage);
router.post("/user/signup", usercontroller.signupPost);
router.get("/user/productdesc/:id", checkSessionAndBlocked,usercontroller.productdescGet);
router.get("/user/OTPUser", usercontroller.OTPGet);
// router.post("/user/OTPUser", usercontroller.OTPPost);
router.get("/user/Mens", checkSessionAndBlocked, usercontroller.mensGet);
// router.post('/Mens', usercontroller.mensPost);
router.post('/shopfilter', usercontroller.mensPost);
router.post('/shopfilterwomen', usercontroller.womenPost);
router.get("/user/Women", checkSessionAndBlocked, usercontroller.womenGet);
router.get("/userLogout", usercontroller.userLogoutGet);
router.get("/homes", usercontroller.homesGet);
router.get("/user/forgotPassword", usercontroller.forgotPassword);
router.post("/user/forgotPassword", usercontroller.forgotPasswordSubmit);
router.get("/user/newOTP", usercontroller.newOTP);
router.post("/user/newOTP", usercontroller.OTPPostNew);
router.get("/user/newPassword", usercontroller.newPassword);
router.post("/user/newPassword", usercontroller.newPasswordSubmit);
router.get("/checkStock/:productId/:newQuantity", usercontroller.stockCheck);
router.put( "/updateQuantity/:productId/:newQuantity", usercontroller.updateQuantity);
router.post("/verifyotp", usercontroller.otpvalidation);
router.get("/resendotp", usercontroller.resendotp);
router.get("/otpget", usercontroller.mailsender);
router.get("/user/cart/:user_id", usercontroller.cart);
router.get("/user/wallet/:userid", usercontroller.wallet);
// router.get('/user/cart/',usercontroller.cart);
router.post("/addtocart/:product_id/:user_id", usercontroller.addTocart);
router.post("/addtocartwishlist/:product_id/:user_id", usercontroller.addTocartwishlist);
// router.post('/create/orderId',razorPayment)
router.get('/user/checkoutpage/:user_id',usercontroller.checkoutpage)
router.post("/create/orderId", razorPayment.razorPayment);
router.get('/user/generateInvoice/:id',usercontroller.generateInvoice)
router.get('/user/wishlist/:id',usercontroller.wishlistget)
router.post('/user/wishlist/toggle/:productId/:userId',usercontroller.wishlistToggle);
router.post('/user/wishlist/remove/:productId/:userId',usercontroller.wishlistRemove);
router.post("/home", usercontroller.homeAddCart);
app.get("/products/:brand", usercontroller.menFilterBrand);
app.post("/filter", usercontroller.menFullFilter);
app.post("/user/Mens/filter", usercontroller.menFiltercombined);
app.use(bodyParser.json());
app.post("/addAddress", usercontroller.addAddressPost)
router.get("/user/cart/update/:user_id/:product_id/:action", usercontroller.cartGet)
router.get('/availableCoupons', usercontroller.availableCoupons);
router.get("/user/cart/remove/:user_id/:product_id", usercontroller.removecart);
router.get("/OrdersCancelPage/:userId",usercontroller.orderCancelPageGet );
router.get("/orderConfirmed",usercontroller.orderConfirmedPage);
router.get("/orderView",usercontroller.orderView );
router.get("/placeOrder/:user_id",usercontroller.placeOrderGet);
router.post("/placeOrder/:user_id",usercontroller.placeOrderPost);
router.post("/paymentFailed/:user_id",usercontroller.paymentFailedPost);
router.get("/orderConfirmed",usercontroller.orderConfirmedPage);
router.get("/yourorders",usercontroller.yourOrders );
router.get("/addAddress/:user_id",usercontroller.addAddressGet);
router.post("/addAddress/:user_id",usercontroller.addAddressSubmit);
router.get("/profile/addAddress",usercontroller.addAddressget );
router.post("/profile/addAddress",usercontroller.addAddresspost );
router.get("/user/orderDetails",usercontroller.orderDetailsGet );
router.get("/user/orderDetails/:id",usercontroller.orderDetailsGet );
router.get("/order/cancelOrder/:orderId",usercontroller.cancelOrderGet );
router.get('/order/returnOrder/:orderId',usercontroller.returnOrderGet);
router.post("/order/cancelconfirm/:orderId",usercontroller.orderCancelConfirmPost);
router.get("/Womem/filter", usercontroller.womenFilterGet);
router.post('/updateUserDetails/:userId',usercontroller.updateUserDetails);
router.post('/changePassword/:userId',usercontroller.changePassword);
    app.post('/user/Mens', usercontroller.userMenPost);

let cartItems = [];

app.use(bodyParser.json());  
module.exports = router;