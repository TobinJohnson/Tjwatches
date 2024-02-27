const express = require('express');
const couponcollection = require('../models/coupon')
const usercollection = require('../models/user')

const addcoupon = async(req, res) => {
    res.render("admin/addcoupon")
    
}
const addcouponpost = async (req, res) => {
    console.log(req.body);
 
    try {
        const data = {
            couponcode: req.body.couponCode,
            discount: req.body.discount,
            expiredate: formatDate(req.body.expireDate),
            purchaseamount: req.body.purchaseamount
        }
        await couponcollection.insertMany([data])
            .then((result) => {
                // console.log('insereted the coupen', result);
                res.redirect('/coupon/admin/viewcoupon')
            })

    } catch (error) {
        console.log(error);
    }
    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
}
const viewcoupon = async (req, res) => {
    try {
        const coupons=await couponcollection.find()
        console.log(coupons+"coupon");
        res.render('admin/coupon',{coupons})
       
    } catch (error) {
        console.log(error);
    }
}
const couponcheck = async (req, res) => {
    try {
        let currentDate = new Date();
        const coupencode = req.body.coupencode;

        if (req.session.coupen && coupencode.toLowerCase() === req.session.coupen.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code has already been applied.',
            });
        }

        const coupen = await coupencollection.findOne({ coupencode: { $regex: new RegExp(coupencode, 'i') } });
        // console.log(coupen && coupen.expiredate > currentDate)

        if (coupen && coupen.expiredate > currentDate && coupencode.toLowerCase() === coupen.coupencode.toLowerCase()) {
            
            const discountAmount = coupen.discount;
            const amountLimit = coupen.purchaseamount;
            req.session.coupen = coupen.coupencode;

            return res.json({ success: true, discount: discountAmount, amount: amountLimit });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code or expired.',
            });
        }
    } catch (error) {
        console.error('Error in coupencheck:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during coupon validation.',
        });
    }
};

const editcoupon=async(req, res) => {
    // Fetch the coupon data based on the ID and pass it to the editcoupon.ejs
    // Use your database logic to fetch the coupon data
    
    const couponId = req.params.id;
    try {
        const coupondata = await couponcollection.find({ _id: couponId })
        const cou=coupondata[0].purchaseamount
        console.log(coupondata+"coupon"+cou+"code");
        res.render('admin/editcoupon', { coupon: coupondata });
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const editcouponpost=async (req, res) => {
    try {
        const couponId = req.params.id; // Assuming you have a hidden field in your form to store the couponId
        console.log(couponId+"coupn");
        const filter = { _id: couponId }; // Assuming _id is the identifier for your coupons

        const update = {
            $set: {
                couponcode: req.body.couponCode,
                discount: req.body.discount,
                expiredate: formatDate(req.body.expireDate),
                purchaseamount: req.body.purchaseamount
            }
        };
        function formatDate(inputDate) {
            const date = new Date(inputDate);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }
        // Use updateOne to update the coupon
        const result = await couponcollection.updateOne(filter, update);

        if (result.modifiedCount === 1) {
            // Coupon updated successfully
            res.redirect('/coupon/admin/viewcoupon');
        } else {
            // Coupon not found or not updated
            // Handle the error or redirect accordingly
            res.status(404).send('Coupon not found or not updated.');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};
const deletecoupon = async(req, res) => {
    // Fetch the coupon ID from the request parameters
    const couponId = req.params.id;

    // Example: Delete coupon data from MongoDB
    try {
        // Example: Delete coupon data from MongoDB using Mongoose
        const deletedCoupon = await couponcollection.findByIdAndDelete(couponId);

        // Check if the coupon with the given ID exists
        if (!deletedCoupon) {
            return res.status(404).send('Coupon not found');
        }
        res.redirect('/coupon/admin/viewcoupon');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = {
    addcoupon,
    addcouponpost,
    viewcoupon,
    couponcheck,
    editcoupon,
    editcouponpost,
    deletecoupon
}