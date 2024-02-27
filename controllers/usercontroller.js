const express=require("express");

const db = require('../models/products');
const dbuser = require('../models/user');
const dbadmin = require('../models/admindetails');
const Cart = require("../models/cartSchema");
const orderDb = require('../models/orderDb')
const wishlistDb = require("../models/wishlist")
const otp = require('../models/otpmodel')
const otpgenerator = require('otp-generator')
require('dotenv').config()
const users = require("../models/user");

const router = express.Router();
const app = express();
// const Razorpay = require("razorpay");

const couponDb = require("../models/coupon")
const usercontroller = require("../controllers/usercontroller");
const razorPayment = require("../controllers/paymentcontroller");


const PDFDocument = require('pdfkit');
const fs = require('fs');

const multer = require('multer')
const mongoose = require("mongoose");
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const bcrypt = require('bcryptjs');
const { log } = require('console');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
});
let data = [];
let emailnewpassword;

// let otp;
let saltRounds = 10;

function isEmailValid(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
const checkSession = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/user/login");
    }
};
const loginGet = (req, res) => {
    let User = req.session.user;
    // console.log(User);
    if (User) {

        //   res.render('/home', )
        res.redirect('/home')
    } else {
        res.render('user/login');
    }
}
const signupGet = (req, res) => {
    let user = req.session.user;
    console.log(user);
    if (user) {
        res.redirect('/home')
    } else
        res.render('user/signup');
}
const profilePage = async(req, res) => {
    let user = req.session.user;

    let user_id = req.session.userid

    const userData = await dbuser.findOne({ email: user });
    const name = userData.firstname
    const userDetials = await dbuser.findOne({ _id: user_id });
    const address = userData.address
    console.log(user_id + "Hello")

    const order = await orderDb.find({ userId: user_id })
    const orderId = await orderDb.find({ userId: user_id }, { _id: 1 })
    const orderIds = orderId.id
        // const orderIdString=orderIds.toString();
        // console.log(order+"order")
        // console.log(orderIds+"orderIds")
        // console.log(orderIdString+"orderIdString")
    console.log(userData + "userdata");

    //  const userData=userData1.address[0]
    // console.log(a.city+"Hai");

    if (user) {
        res.render('user/profilepage', { userData, address, userId: user_id, orders: order, orderIds: orderId, name: name, userid: user_id })

        // res.render('user/profilepage',{a})

    } else
        res.render('user/login');
}
const homeGet = async(req, res) => {
    try {

        const userData = await dbuser.findOne({ email: req.session.user });
        const name = userData.firstname

        const userId = userData._id;
        const userobject = datauser._id
        const userid = userobject.toString();
        console.log('User ID:', userid);
        // const userId = req.session.user
        const count = await Cart.find({ userid: userId }).count()
        console.log(count+"count");
        // try {
        //     const count = await Cart.find({ userid: user_id }).count()
        //     console.log("Total number of products in the cart:", count);
        // } catch (error) {
        //     console.error("Error counting products in the cart:", error);
        // }

        console.log("into the home page get" + userId)
        const products = await db.find({}).skip(1).limit(9);
        //  let userId = await dbuser.id;
        //  const userId = req.params.id;

        // const userinfo = await dbuser.findById(userid)

        res.render('user/homepage', { products, userid, userId, name });
    } catch (error) {
        console.log(error)
    }

}
const homeAddCart = async(req, res) => {
    const { productid, userid } = req.body;

    try {
        // Create a new instance of the Cart model with productId and userId
        const cartItem = await Cart.create({ productid, userid });
        console.log(cartItem);
        res.status(201).json({ message: "Item added to cart", cartItem });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Failed to add item to cart", error: err.message });
    }
};
const signupPost = (async(req, res) => {

    try {
        console.log(req.body.username, req.body.password);
        const existingUser = await dbuser.findOne({ email: req.body.email });

        if (existingUser && existingUser.email === req.body.email) {
            return res.render('user/signup', {
                email: 'This Email already exists.',
            });
        } else {
            data = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mobile: req.body.phone,
                email: req.body.email,
                password: req.body.password,
                // OTP: otp
            };
            let hashedPassword = await bcrypt.hash(data.password, saltRounds)
            newUser = {
                firstname: data.firstname,
                lastname: data.lastname,
                mobile: data.mobile,
                email: data.email,
                password: hashedPassword,
            };

            // Additional processing or saving logic here if needed

            // Redirect to OTPUser page
            //  res.redirect('/user/OTPUser');
            req.session.data = newUser;
            console.log(newUser);
            const existingUser = await dbuser.findOne({ email: newUser.email });

            if (existingUser) {
                res.send("This account already exists");
                return;
            }

            // await collection1.insertMany(data);


            mailsender(newUser)


            res.render("user/OTPUser.ejs");

        }
    } catch (error) {
        console.error('Error in signupPost:', error);
        // Handle the error appropriately, such as rendering an error page
        res.render('errorPage', { error: 'An error occurred during signup.' });
    }
})

const OTPGet = async(req, res) => {
    const email = data.email;
    console.log(email + "OTPGET");
    const checkSession = (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.render("user/OTPUser", { email });
        }
    };
    // res.render('user/OTPUser')
    try {
        const email = data.email;
        console.log(email + "email")
        console.log(data.email + "email")

        // Generate a 6-digit OTP   
        let otp = Math.floor(Math.random() * 900000) + 1000;
        console.log(otp)


        // Send OTP to the provided email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., 'gmail', 'hotmail', etc.
            auth: {
                user: process.env.email,
                pass: process.env.password,
                // pass:'tj8891766330',
            },
        });
        const mailOptions = {
            from: process.env.email,
            to: data.email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        //   await dbuser.create({ email, otp });

    } catch (error) {
        console.error('Error during signup:', error);
    }

    res.render('user/OTPUser')


}

const OTPPost = async(req, res) => {

    const { email } = req.body;
    const user = await dbuser.findOne({ email });
    const digit1 = req.body.digit1
    const digit2 = req.body.digit2
    const digit3 = req.body.digit3
    const digit4 = req.body.digit4;

    // Combine the digits to form the entered OTP
    const enteredOTP = `${digit1}${digit2}${digit3}${digit4}`;
    console.log(enteredOTP)

    // Concatenate the digits to form the entered OTP

    // Use the enteredOTP for further processing (e.g., sending to the server for validation)
    console.log('Entered OTP:', enteredOTP);
    console.log('OTP:', otp);

    if (enteredOTP == otp) {
        res.redirect('/user/login')
            // console.log(data)
        await dbuser.insertMany([newUser])
            // .then(x => {
            //   req.session.bool = true;
            //   console.log('inserted');
            //   // await userCollection.find()
            //   res.render('user/OTPUser');
            // })
    } else {
        res.render('user/OTPUser', {
            wrong: 'OTP Invalid'
        })
    }
}

let datauser;
const loginPost = async(req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        if (!req.body.email || !req.body.password) {
            return res.render('user/login', {
                email: !req.body.email ? 'Email is required.' : '',
                password: !req.body.password ? 'Password is required.' : '',
            });
        }

        // Regular expression to validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;

        if (!emailRegex.test(req.body.email)) {
            return res.render('user/login', {
                email: 'Invalid email format.',
                password: '',
                enteredEmail: email || '', // Pass entered email back to the view
                enteredPassword: password || '',
            });
        }

        datauser = await dbuser.findOne({ email: req.body.email });

        if (datauser) {
            if (datauser.isBlocked) {
                console.log('User is blocked');
                return res.render('user/login', {
                    Blocked: 'Your account is blocked. Please contact support.',
                    enteredEmail: email || '', // Pass entered email back to the view
                    enteredPassword: password || '',
                });
            }

            // Compare the entered password with the hashed password from the database
            const isMatch = await bcrypt.compare(req.body.password, datauser.password);
        // if (req.body.password===datauser.password) {

            if (isMatch) {
                // User's credentials match, set session and redirect
                req.session.user = datauser.email;
                req.session.userid = datauser._id
                console.log(req.session.user);
                return res.redirect('/home');

            } else {
                // Passwords don't match
                return res.render('user/login', {
                    password: 'Invalid password',
                    enteredEmail: email || '',
                    enteredPassword: password || '',
                });
            }
        }
    } catch (error) {
        // Handle errors during login process
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = loginPost;


const menPage = async(req, res) => {
    try {
        const searchQuery = req.query.search;
        // Search for products based on the search query (using a simple example here)
        const products = await db.find({
            category: "Men",
            name: { $regex: searchQuery, $options: "i" },
        });

        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const productdescGet = async(req, res) => {
    try {
        const userData = await dbuser.findOne({ email: req.session.user });
        const name = userData.firstname
        userid = req.session.userid
        console.log(userid + "user");
        const productid = await req.params.id
        console.log(productid + "product")
        const products = await db.find({})
        const dataproduct = await db.findById(productid)
        console.log(dataproduct)
        res.render('user/productdesc', { dataproduct, productid, userid,name })
    } catch (error) {
        res.render('admin/error');
    }
}
const mensGet = async(req, res) => {


    const page = parseInt(req.query.page) || 1; // Get the requested page number from query parameter, default to page 1
    const limit = 6; // Number of products per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    userid = req.session.userid
    const userData = await dbuser.findOne({ email: req.session.user });
    const name = userData.firstname
    console.log("mensGet");


    try {
        const products = await db.find({ "category": "Men" }).skip(skip).limit(limit);
        const totalProducts = await db.find({ "category": "Men" }).countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        // Render the EJS file and pass data to it
        res.render('user/Mens', {
            products,
            currentPage: page,
            totalPages,
            userid,
            name
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const mensPost = async(req, res) => {
    console.log("hello");
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;
    console.log(page+"page");
    userid = req.session.userid
    const userData = await dbuser.findOne({ email: req.session.user });
    const name = userData.firstname
    const { brand, sort, lowprice, highprice, search} = req.body;

    try {
        let query = { category: "Men" };
        console.log(query+"query");
        // Apply brand filter
        if(req.body.brand!=='Select Category'){
            query.brand = req.body.brand;

        }
       

        // Apply sort filter
        // Assuming 'low-high' means ascending order and 'high-low' means descending order
        const sortDirection = req.body.sort === 'low-high' ? 1 : -1;
        // query=query.sort({ price: sortDirection });
       

        // Apply price range filter
        if (req.body.lowprice && req.body.highprice) {
            query.price = { $gte: parseInt(req.body.lowprice), $lte: parseInt(req.body.highprice) };
        }

        const totalProducts = await db.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / perPage);
        const skip = (page - 1) * perPage;
        console.log(skip+"skip");

        const products = await db.find(query).skip(skip).limit(perPage).sort({ price: sortDirection });
        console.log(products+"products");
        // res.json({ status: 'success', data: products });

        res.render('user/Mens', {
            products: products,
            currentPage: page,
            totalPages: totalPages,name:name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};



const womenGet = async(req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from query parameter, default to page 1
    const limit = 6; // Number of products per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    const userData = await dbuser.findOne({ email: req.session.user });
    const name = userData.firstname
    userid = req.session.userid



    try {
        const products = await db.find({ "category": "Women" }).skip(skip).limit(limit);
        const totalProducts = await db.find({ "category": "Women" }).countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('user/Women', {
            products,
            name,
            userid,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
const womenPost = async(req, res) => {
    console.log("hello");
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;
    console.log(page+"page");
    userid = req.session.userid
    const userData = await dbuser.findOne({ email: req.session.user });
    const name = userData.firstname
    const { brand, sort, lowprice, highprice, search} = req.body;

    try {
        let query = { category: "Women" };
        console.log(query+"query");
        // Apply brand filter
        if(req.body.brand!=='Select Category'){
            query.brand = req.body.brand;

        }
       

        // Apply sort filter
        // Assuming 'low-high' means ascending order and 'high-low' means descending order
        const sortDirection = req.body.sort === 'low-high' ? 1 : -1;
        // query=query.sort({ price: sortDirection });
       

        // Apply price range filter
        if (req.body.lowprice && req.body.highprice) {
            query.price = { $gte: parseInt(req.body.lowprice), $lte: parseInt(req.body.highprice) };
        }

        const totalProducts = await db.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / perPage);
        const skip = (page - 1) * perPage;
        console.log(skip+"skip");

        const products = await db.find(query).skip(skip).limit(perPage).sort({ price: sortDirection });
        console.log(products+"products");
        // res.json({ status: 'success', data: products });

        res.render('user/Women', {
            products: products,
            currentPage: page,
            totalPages: totalPages,name:name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const userLogoutGet = (req, res) => {
    console.log(req.session.user)
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.render('error');
        } else {
            res.redirect('/user/login'), {
                logout: "Logout Successfully...!"
            }
        }
    })
}

const homesGet = async(req, res) => {
    const products = await db.find({});
    res.render('user/homestart', { products });
}

const forgotPassword = async(req, res) => {
    const products = await db.find({});
    res.render('user/forgotPassword');
}


const forgotPasswordSubmit = async(req, res) => {
    try {
        const existingUser = await dbuser.findOne({ email: req.body.email });
        emailnew = req.body.email
        if (existingUser) {
            res.redirect('/user/newOTP');
        } else {
            res.render('user/forgotPassword', {
                email: 'This Email does not exist.'
            });
        }
    } catch (error) {
        // Handle any unexpected error that might occur during database query or redirection
        console.error('Error in forgotPasswordSubmit:');
        res.status(500).send('Internal Server Error');
    }
};

const newOTP = async(req, res) => {
    try {
        email = emailnew
        console.log(email + "email")
        // console.log(data.email + "email")
        let otp = Math.floor(Math.random() * 900000) + 1000;
        console.log(otp)
            // Send OTP to the provided email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., 'gmail', 'hotmail', etc.
            auth: {
                user: process.env.email,
                pass: process.env.password,
                // pass:'tj8891766330',
            },
        });
        const mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        //   await dbuser.create({ email, otp });

    } catch (error) {
        console.error('Error during signup:', error);
    }

    res.render('user/newOTPPage');
};

















const OTPPostNew = async(req, res) => {

    const { email } = req.body;
    const user = await dbuser.findOne({ email });
    const digit1 = req.body.digit1
    const digit2 = req.body.digit2
    const digit3 = req.body.digit3
    const digit4 = req.body.digit4;

    // Combine the digits to form the entered OTP
    const enteredOTP = `${digit1}${digit2}${digit3}${digit4}`;
    console.log(enteredOTP)

    // Concatenate the digits to form the entered OTP

    // Use the enteredOTP for further processing (e.g., sending to the server for validation)
    console.log('Entered OTP:', enteredOTP);
    console.log('OTP:', otp);

    if (enteredOTP == otp) {
        res.redirect('/user/newPassword')

    } else {
        res.render('user/OTPUser', {
            wrong: 'OTP Invalid'
        })
    }
}

const newPassword = async(req, res) => {

    res.render('user/newPasswordpage');
}

const newPasswordSubmit = async(req, res) => {
    let hashedPassword = await bcrypt.hash(req.body.newPassword, saltRounds)

    newuser = {
        email: emailnew,
        password: hashedPassword,
    }

    const result = await dbuser.updateOne({ email: emailnew }, { $set: { password: hashedPassword } });
    res.redirect('/user/login');
}

const cart = async(req, res) => {
    const userData = await dbuser.findOne({ email: req.session.user });
    console.log(userData + "userdata");
    console.log(req.session.user + "session email");
    const name = userData.firstname
    try {

        const user_id = req.params.user_id;
        console.log(user_id + "Hellocart");
        // Find the user's cart items
        const cartItems = await Cart.findOne({ userid: user_id });
        const count = await Cart.find({ userid: user_id }).count()


        if (!cartItems) {

            return res.render("user/cart2", {
                cartItems: [],
                totalPrice: 0,
                user_id: user_id,
                name: name,
                userid: user_id,    
            });
        }

        // Fetch product details for each item in the cart
        const productsWithQuantity = await Promise.all(cartItems.products.map(async(item) => {
            const productDetails = await db.findById(item.productid); // Assuming Product is your model name
            // console.log(productDetails+"product details")
            return { productDetails, quantity: item.quantity };
        }));

        // Calculate total price using reduce
        const totalPrice = productsWithQuantity.reduce((acc, item) => {
            return acc + (item.productDetails.price * item.quantity);
        }, 0);

        res.render("user/cart2", {
            cartItems: productsWithQuantity,
            totalPrice: totalPrice,
            user_id: user_id,
            name: name,
            userid: user_id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
const wallet = async(req, res) => {
    const userData = await dbuser.findOne({ email: req.session.user });
    console.log(userData + "userdata");
    console.log(req.session.user + "session email");
    const name = userData.firstname
    try {

        const user_id = req.params.user_id;
        console.log(user_id + "Hellowallet");
        // Find the user's cart items
      


        res.render("user/wallet", {
            userdetails:userData,
            user_id: user_id,
            name: name,
            userid: user_id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
    const checkoutpage =async(req,res)=>{
        const userData = await dbuser.findOne({ email: req.session.user });
        const name = userData.firstname
        try {
    
            const user_id = req.params.user_id;
            console.log(user_id + "Hellocart");
            // Find the user's cart items
            const cartItems = await Cart.findOne({ userid: user_id });
            const productsWithQuantity = await Promise.all(cartItems.products.map(async(item) => {
                const productDetails = await db.findById(item.productid); // Assuming Product is your model name
                // console.log(productDetails+"product details")
                return { productDetails, quantity: item.quantity };
            }));
    
            // Calculate total price using reduce
            const totalPrice = productsWithQuantity.reduce((acc, item) => {
                return acc + (item.productDetails.price * item.quantity);
            }, 0);
        // const name = userData.firstname
        res.render('user/checkout', {
            cartItems: productsWithQuantity,
            totalPrice: totalPrice,
            user_id: user_id,
            name: name,
            userid: user_id
        })} catch (error) {console.error(error);
            res.status(500).send("Internal Server Error");
        }
            
    }

const addTocart = async(req, res) => {
    const { product_id, user_id } = req.params;

    try {
        // Fetch product details from the database (assuming you have a model named 'Product')
        const product = await db.findById(product_id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let userCart = await Cart.findOne({ userid: user_id });

        if (!userCart) {
            userCart = new Cart({
                userid: user_id,
                products: [{ productid: product_id, quantity: 1 }],
            });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = userCart.products.findIndex(
                (p) => p.productid.toString() === product_id
            );

            if (existingProductIndex !== -1) {
                // If the product exists, increase the quantity
                userCart.products[existingProductIndex].quantity += 1;
            } else {
                // If the product doesn't exist, add a new product entry
                userCart.products.push({ productid: product_id, quantity: 1 });
            }
        }

        await userCart.save();
        // res.send(userCart)

        res.redirect("/home");
        // res.json({ success: true, userCart });
        // res.status(200).send("Product added")
        // res.send(userCart)


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const addTocartwishlist = async(req, res) => {
    const { product_id, user_id } = req.params;

    try {
        // Fetch product details from the database (assuming you have a model named 'Product')
        const product = await db.findById(product_id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let userCart = await Cart.findOne({ userid: user_id });

        if (!userCart) {
            userCart = new Cart({
                userid: user_id,
                products: [{ productid: product_id, quantity: 1 }],
            });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = userCart.products.findIndex(
                (p) => p.productid.toString() === product_id
            );

            if (existingProductIndex !== -1) {
                // If the product exists, increase the quantity
                userCart.products[existingProductIndex].quantity += 1;
            } else {
                // If the product doesn't exist, add a new product entry
                userCart.products.push({ productid: product_id, quantity: 1 });
            }
        }

        await userCart.save();
        // res.send(userCart)
        
        res.redirect("/home");
        // res.json({ success: true, userCart });
        // res.status(200).send("Product added")
        // res.send(userCart)


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const stockCheck = async(req, res) => {
    try {
        const { productId, newQuantity } = req.params;

        // Find the product by ID
        const product = await db.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the new quantity is less than or equal to the available stock
        const availableStock = product.quantity;
        console.log(product.quantity)
        console.log(newQuantity)

        if (parseInt(newQuantity, 10) > availableStock) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // If stock is available, send a success response
        res.status(200).json({ message: 'Stock available' });
    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const updateQuantity = async(req, res) => {
    try {
        const { productId, newQuantity } = req.params;
        const userEmail = req.session.user;

        // Assuming you have a User model
        const userObj = await dbuser.findOne({ email: userEmail });
        if (!userObj) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userObj._id;
        console.log(userId + "userid");
        // Find the cart for the user
        const userCart = await Cart.findOne({ userid: userId });
        console.log(userCart + "usercart");
        if (!userCart) {
            console.log(userCart);
            return res.status(404).json({ error: 'Cart not found' });
        }
        const cartItemIndex = userCart.products.findIndex(product => product.productid.equals(productId));

        if (cartItemIndex === -1) {
            return res.status(404).json({ error: 'Product not found in the cart' });
        }
        // Find the cart item and update the quantity and price
        const cartItem = userCart.products.find(product => product.productid.equals(productId));
        console.log(cartItem + "cartItems");
        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in the cart' });
        }

        // Update the quantity for the specified product in the cart
        userCart.products[cartItemIndex].quantity = parseInt(newQuantity, 10);

        // If the new quantity is less than 1, remove the product from the cart
        if (userCart.products[cartItemIndex].quantity <= 0) {
            console.log("Removing product from cart");
            userCart.products.splice(cartItemIndex, 1);
        }
        // Find the corresponding product to get the original price
        const product = await db.findById(productId);
        // const newPrice = product.price * parseInt(newQuantity, 10);

        // console.log(newPrice+"newPrice");
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update the quantity and price for the specified product in the cart
        cartItem.quantity = parseInt(newQuantity, 10);
        
        // Save the changes to the cart
        await userCart.save();

        return res.status(200).json({ message: 'Quantity and price updated successfully', updatedCart: userCart });
    } catch (error) {
        console.error('Error updating quantity and price in the cart:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
let genotp = () => {
    return otpgenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
}

const mailsender = async(newUser) => {
    const generatedOTP = genotp();
    console.log(generatedOTP)
    const otpDocument = new otp({

        email: email,
        otp: generatedOTP
    });

    try {
        await otpDocument.save();
        // Send the email with the generated OTP
        transporter.sendMail({
            from: process.env.email,
            to: newUser.email,
            subject: "OTP Verification",
            text: "Verify Your Email Using the OTP",
            html: `Verify Your Email Using this OTP: ${generatedOTP}`,
        }, (err, info) => {
            if (err) {
                console.log("Error sending email:", err);
            } else {
                console.log("Email sent successfully. Message ID:", info.messageId);
            }
        });
    } catch (error) {
        console.error("Error saving OTP to the database:", error);
    }

}
const resendotp = (req, res) => {
    console.log('xxxxxxx')
    mailsender(req.session.data)
    console.log('mm')
}

const otpvalidation = async(req, res) => {
    try {
        console.log('hizzz')
        const x = await otp.find({}).sort({ _id: -1 }).limit(1);
        console.log(x);
        const otpvalue = req.body;

        console.log(otpvalue);

        if (x.otp == otpvalue.otp) {
            console.log('zzzzzzz')
            console.log(req.session.data);
            const newuser = await new dbuser(req.session.data).save();
            console.log(newuser);

            console.log("hi");
            // Send success response
            res.json({ success: true, message: 'OTP verification successful' });



        } else {
            // Send error response
            res.status(400).json({ success: false, message: 'Invalid OTP' });

        }
    } catch (error) {
        console.error(error);
        // Send error response in case of an exception
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
const menFilterBrand = (req, res) => {
    const brand = req.params.brand;
    // Filter products based on the provided brand
    const filteredProducts = products.filter(
        (product) => product.brand === brand
    );
    res.render("user/Mens", { products: filteredProducts });
};

const menFullFilter = async(req, res) => {
    const { brand, dialSize, dialShape, rating, minPrice, maxPrice } = req.body;
    const products = await db.find({ category: "Men" });
    // Filtering logic based on form data
    let filteredProducts = products.filter((product) => {
        return (
            (brand === "all" || product.brand === brand) &&
            (dialSize === "all" || product.dialSize === parseInt(dialSize)) &&
            (dialShape === "all" || product.dialShape === dialShape) &&
            (rating === "all" || product.rating >= parseInt(rating)) &&
            (!minPrice || product.price >= parseInt(minPrice)) &&
            (!maxPrice || product.price <= parseInt(maxPrice))
        );
    })
};

const menFiltercombined = async(req, res) => {
    const { brands, minPrice, maxPrice } = req.body;
    const products = await db.find({ category: "Men" });
    console.log(products + "product");

    console.log(req.body);

    const filteredProducts = products.filter((product) => {
        return (
            (brands === "all" || product.brand === brands) &&
            (!minPrice || product.price >= parseInt(minPrice)) &&
            (!maxPrice || product.price <= parseInt(maxPrice))
        );

        // Return the filtered products to the client
        res.json(filteredProducts);
    });
};

const addAddressPost = async(req, res) => {
    try {
        // Create a new address object from the request body
        const newAddress = req.body;
        console.log("1", req.body);
        // Push the new address object to the 'address' array
        await users.address.push(newAddress);

        // Save the updated user document back to the database
        const updatedUser = await users.save();
        // updatedUser.address
        res.status(200).json({ success: true }); // Respond with the updated addresses array
    } catch (error) {
        res.status(500).json({ error: "Failed to add address" });
    }
};

const cartGet = async(req, res) => {

    try {
        const { user_id, product_id, action } = req.params;
        // console.log({ user_id, product_id, action });
        // Find the user's cart
        const cart = await Cart.findOne({ userid: user_id });
        // console.log("cart"+cart);

        // Find the product in the cart
        const productIndex = cart.products.findIndex(
            (item) => item.productid == product_id
        );
        // console.log(productIndex);
        if (productIndex === -1) {
            return res
                .status(404)
                .json({ message: "Product not found in the cart" });
        }

        // Update product quantity based on the action (increase/decrease)
        if (action === "increase") {
            cart.products[productIndex].quantity += 1;
        } else if (action === "decrease") {
            if (cart.products[productIndex].quantity > 1) {
                cart.products[productIndex].quantity -= 1;
            } else {
                // Remove the product from the cart if quantity becomes zero
                cart.products.splice(productIndex, 1);
            }
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        // Update the cart in the database
        await cart.save();

        // Fetch the updated cart data
        const updatedCart = await Cart.findOne({ userid: user_id });

        // Calculate total price based on updated cart data
        const totalPrice = updatedCart.products.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0);

        // Respond with updated cart details
        res.status(200).json({
            cartItems: updatedCart.products,
            totalPrice,
            updatedValue: cart.products[productIndex].quantity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
    const generateInvoice = async (req, res) => {
    try {
    //   let user = req.session.user;
      let userId = req.session.userid

    //   let userId = user.user_id;
      console.log(userId);
      const orderId = req.params.id;
      console.log("Entered");
  
      const invoiceDetails = await orderDb.findOne({ _id: orderId});
      console.log("Invoice", invoiceDetails);
  
    
  
    //   Create a new PDF document
      const doc = new PDFDocument();
  
    //   Set response headers to trigger a download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    //   Pipe the PDF document to the response
      doc.pipe(res);
    //   const imagePath = "public/img/first.png"; // Change this to the path of your image
    //   const imageWidth = 100; // Adjust image width based on your layout
    //   const imageX = 550 - imageWidth; // Adjust X-coordinate based on your layout
    //   const imageY = 50; // Adjust Y-coordinate to place the image at the top
    //   doc.image(imagePath, imageX, imageY, { width: imageWidth });
    doc.text(`Company: TJ Watches`, { align: "center" });

    //   Move to the next section after the image
      doc.moveDown(1);
  
    //   Add content to the PDF document
      doc.fontSize(16).text("Billing Details", { align: "center" });
      doc.moveDown(1);
      doc.fontSize(10).text("Customer Details", { align: "center" });
      doc.text(`Order ID: ${orderId}`);
      doc.moveDown(0.3);
      doc.text(`Name: ${invoiceDetails.username || ""}`);
      doc.moveDown(0.3);
      doc.text(`House Name: ${invoiceDetails.address.address || ""}`);
      doc.moveDown(0.3);
      doc.text(`City: ${invoiceDetails.address.city|| ""}`);
      doc.moveDown(0.3);
      doc.text(`State: ${invoiceDetails.address.state|| ""}`);
      doc.moveDown(0.3);
      doc.text(`Pincode: ${invoiceDetails.address.pincode|| ""}`);
      doc.moveDown(0.3);
      doc.text(`Order Date: ${invoiceDetails.orderDate|| ""}`);
      doc.moveDown(0.3);
      doc.text(`Expected delivery Date: ${invoiceDetails.deliveryDate|| ""}`);
      doc.moveDown(0.3);


    //   const address = specificOrder.address;
    //   doc.text(
    //     `Address: ${address.address}, ${address.city}, ${address.state} ${
    //       address.pincode || ""
    //     }`
    //   );
    //   doc.moveDown(0.3);
      doc.text(`Payment Method: ${invoiceDetails.paymentMethod || ""}`);
      doc.moveDown(0.3);
  
      const headerY = 300; // Adjust this value based on your layout
      doc.font("Helvetica-Bold");
      doc.text("Index", 70, headerY, { width:40, lineGap: 5 });
      doc.text("Name", 150, headerY, { width: 150, lineGap: 5 });
      doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
      doc.text("Quantity", 400, headerY, { width: 50, lineGap: 5 });
      doc.text("Price", 450, headerY, { width: 150, lineGap: 5 });
      doc.font("Helvetica");
  
    //   Table rows
      const contentStartY = headerY + 30; // Adjust this value based on your layout
      let currentY = contentStartY;
      invoiceDetails.products.forEach((product, index) => {
        doc.text(`${index+1}` || "", 70, currentY, {
            width: 20,
            lineGap: 10,
          });
        doc.text(product.product || "", 150, currentY, {
          width: 150,
          lineGap: 4,
        });
  
        doc.text(product.status || "", 300, currentY, {
          width: 50,
          lineGap: 10,
        });
        doc.text(product.quantity || "", 400, currentY, {
          width: 50,
          lineGap: 10,
        });
  
        doc.text(product.price || "", 450, currentY, {
          width: 150,
          lineGap: 10,
        });
        console.log("Reached Here");
  
        // Calculate the height of the current row and add some padding
        const lineHeight = Math.max(
          doc.heightOfString(product.product || "", { width: 150 }),
          doc.heightOfString(product.status || "", { width: 150 }),
          doc.heightOfString(product.quantity  || "", {width: 50,}),
          doc.heightOfString(product.price || "", { width: 50 })
        );
        currentY += lineHeight + 10; // Adjust this value based on your layout
      });
      doc.text(`Total Price: ${invoiceDetails.totalPrice || ""}`, {
        // width: 400, // Adjust the width based on your layout
        lineGap: 5,align: "center"
      });
  
      // Set the y-coordinate for the "Thank you" section
      const separation = 50; // Adjust this value based on your layout
      const thankYouStartY = currentY + separation; // Update this line
  
    //   // Move to the next section
      doc.y = thankYouStartY; // Change this line
  
    //   Move the text content in the x-axis
      const textX = 60; // Adjust this value based on your layout
      const textWidth = 500; // Adjust this value based on your layout
      doc
        .fontSize(12)
        .text(
          "Thank you for choosing TJ Watches! We appreciate your support and are excited to have you as part of our family.",
          textX,
          doc.y,
          { align: "left", width: textWidth, lineGap: 10 }
        );
    
      doc.end();
    } catch (error) {
      res.render("user/error");
    }
     };
  const wishlistget= async(req,res) => {
    const userData = await dbuser.findOne({ email: req.session.user });
    const name = userData.firstname
    try {
    // const user_id = req.params.user_id;
    const user_id = req.params.id;

    console.log(user_id+"userid");
    // const wishlistItems = await wishlistDb.findOne({ userid: user_id });
    const wishlistItems = await wishlistDb.find({ userid: user_id });
    console.log(wishlistItems+"wishlistitems");
    if (!wishlistItems || wishlistItems.length === 0) {

        return res.render("user/wishlist", {
            wishlistItems: [],
            user_id: user_id,
            name: name,
            userid: user_id
        });
    }
      // Extract product IDs from wishlist items
    //   const productIds = wishlistItems.map(item => item.products.map(product => product.productid));
    // const productIds = wishlistItems.map(item => item.productid.map(product => product.productid));
    const productIds = wishlistItems.map(item => item.productid).flat();

    console.log(productIds+"productIds");
      // Fetch product details from the product database
      const productDetails = await db.find({ _id: { $in: productIds } });
    console.log(productDetails+"productDetails");
    
    
    res.render("user/wishlist",{name:name,userid:user_id,wishlistItems:wishlistItems, productDetails: productDetails,user_id: user_id}); }
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
}
};;
const wishlistToggle=async (req, res) => {
    console.log("entered wishlist ");
    const productId = req.params.productId
    const userId = req.params.userId;
    const product =  await db.find({_id: productId });

    console.log(product+"product");
    if (product) {

    const wishlistUpdate = await wishlistDb.findOneAndUpdate(
        { userid: userId },
        { $addToSet: {productid: productId } }, // Use $addToSet to avoid duplicate entries
        { upsert: true, new: true }
    );

    res.json({ status: 'success' });
} else {
    res.json({ status: 'error', message: 'Product not found' });

}}

const wishlistRemove= async (req, res) => {
   

    try {
        // const { userid, productid } = req.params;
        const productId = req.params.productId;
        const userId = req.params.userId;
        console.log(productId+"prodductId");
        console.log(userId+"userid");
        var wishlist = await wishlistDb.findOne({ userid: userId });
        console.log(wishlist+"wishlist");
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        wishlist.productid = wishlist.productid.filter(item => item !== productId);
        // Update the cart in the database
        await wishlist.save();



        // Fetch the updated wishlist data
        const updatedWishlist = await wishlistDb.findOne({ userid: userId });
        // Respond with updated cart details
        res.status(200).send({ status: 'success',wishlistItems: updatedWishlist});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
const availableCoupons = async (req, res) => {
    try {
        // Fetch available coupons from the database
        const availableCoupons = await couponDb.find({ expiredate: { $gt: new Date() } });
        console.log(availableCoupons+"available");
        // Send the fetched coupons as a response
        res.json(availableCoupons);
    } catch (error) {
        // Handle errors if any
        console.error('Error fetching available coupons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const removecart=async(req, res) => {
    try {
        const { user_id, product_id } = req.params;
        console.log(product_id+"productid");
        // Find the user's cart
        const cart = await Cart.findOne({ userid: user_id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Remove the product from the cart
        const updatedProducts = cart.products.filter(
            (item) => item.productid != product_id
        );
        cart.products = updatedProducts;

        // Update the cart in the database
        await cart.save();

        // Fetch the updated cart data
        const updatedCart = await Cart.findOne({ userid: user_id });

        // Calculate total price based on updated cart data
        const totalPrice = updatedCart.products.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0);

        // Respond with updated cart details
        res.status(200).json({ cartItems: updatedCart.products, totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
const orderCancelPageGet=async(req, res) => {
    const userId = req.params.userId;
    const userData = users.findOne({ email: req.session.user });
    const name = userData.firstname

    try {
        // Find orders for the user with "Cancellation Pending" status
        const orders = await orderDb.find({ userId, status: "Cancelled" });
        // let user_id=req.session.userid
        // const order = await orderDb.find({userId:user_id})
        // const orderIds = await orderDb.find({userId:user_id},{_id:1})
        // console.log(order+"order")
        // console.log(orderIds+"orderIds")

        // res.render('user/yourorders',{userId:user_id,orders:order,orderIds:orderIds});
        res.render("user/OrdersCancelPage", { userId, orders, name, userid: userId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}
const orderConfirmedPage= (req, res) => {
    res.render("user/orderConfirmed");
}
const orderView=(req, res) => {
    res.render("user/orderView");
}
const placeOrderGet= async(req, res) => {
    const userId = req.params.user_id;
    // const totalPrice = req.query.totalPrice;
    const totalPrice = req.query.totalPrice;
    console.log(totalPrice+"totalprice");



    console.log(userId + "HEllo");
    console.log("asssddd", req.session.userid);
    const userDetials = await users.findOne({ _id: userId });
    // console.log(userDetials+"hai");
    const address = userDetials.address;
    // console.log(address+"hello");
    // console.log(userDetials.address[0].housename+"Hello");
    // console.log(address[0].housename+"Hello");

    const cart = await Cart.findOne({ userid: userId });
    // console.log(cart);

    if (!cart) {
        return res.render("user/placeOrder", {
            cart: [],
            // name: name,
            totalPrice: 0,
            address: address,
        });
    } else {
        // Fetch product details for each item in the cart
        const productsWithQuantity = await Promise.all(
            cart.products.map(async(item) => {
                const productDetails = await db.findById(item.productid); // Assuming Product is your model name
                return { productDetails, quantity: item.quantity };
            })
        );

        // Calculate total price using reduce
        // const totalPrice = productsWithQuantity.reduce((acc, item) => {
        //     return acc + item.productDetails.price * item.quantity;
        // }, 0);
        console.log(userId + "Last");
        res.render("user/placeOrder", {
            cart: productsWithQuantity,
            finalTotalPrice: totalPrice,
            user_id: userId,
            address: address,
        });
    }
}
const placeOrderPost= async(req, res) => {
    const user_Id = req.session.userid;
    try {
        console.log("here");
       

        console.log(user_Id + " Order");
        // const selectedAddressIndex = req.body.deliveryAddress;


        const paymentMethod = req.body.paymentmode;
        if(paymentMethod ==="COD") {
        var selectedAddressIndex = req.body.deliveryAddress;   
         }else{ var selectedAddressIndex =  req.query.deliveryAddress;
         }
         console.log(selectedAddressIndex+"hello");

        const user = await users.findOne({ _id: user_Id });
        console.log(user+"user");
        const selectedAddress = user.address[selectedAddressIndex];
        // console.log("index", selectedAddress);

        const cart = await Cart.findOne({ userid: user_Id });
        console.log(cart + "cart");

        if (!cart) {
            return res.render("user/placeOrder", {
                cart: [],
                totalPrice: 0,
                address: address,
            });
        } else {
            let products = [];
            let totalQuantity = 0;
            // let totalCartPrice = 0;

            const productsWithQuantity = await Promise.all(
                cart.products.map(async(item) => {
                    const productDetails = await db.findById(item.productid); 

                    return { productDetails, quantity: item.quantity };
                })
            );

            let totalPrice = 0;
                console.log("here1");
            for (const item of productsWithQuantity) {
                // totalPrice += item.productDetails.price * item.quantity;

                products.push({
                    productid: item.productDetails._id,
                    product: item.productDetails.name, 
                    category: item.productDetails.category, 
                    brand: item.productDetails.brand,
                    quantity: item.quantity,
                    price: item.productDetails.price,
                    status: "Confirmed",
                });

                // totalCartPrice += cartItem.price * cartItem.quantity;
                // console.log(req.body.totalPrice + "total price");
                // totalCartPrice = totalPrice;
                // console.log(totalCartPrice);
                await db.updateOne({ _id: item.productDetails._id }, { $inc: { quantity: -item.quantity } });

                totalQuantity += item.quantity;
            }
            totalPrice = req.query.totalPrice;
            console.log(totalPrice + "totalprice");

            const newOrder = new orderDb({
                userId: user_Id,
                username: user.firstname, 
                products: products,
                totalQuantity: totalQuantity,
                // totalPrice: totalCartPrice,
                totalPrice: totalPrice,

                address: {
                    address: selectedAddress.housename,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                },
                paymentMethod: paymentMethod,
                orderDate: new Date(),
                deliveryDate: new Date().setDate(new Date().getDate() + 7),
            });

            await newOrder.save();
            console.log(newOrder);

            await Cart.deleteMany({ userid: user_Id });
            res.redirect(`/orderconfirmed`);
        }
    } catch (err) {
        console.error(err);
        const newOrder = new orderDb({
            userId: user_Id,
            status: "Pending", // Set the status to "Pending" on error
        });

        // await newOrder.save();
        res.redirect('/'); // Redirect to the home page or handle errors appropriately
        res.status(500).send("ServerError");
    }}
const paymentFailedPost=async(req, res) => {

    const user_Id = req.session.userid;
    const user = await users.findOne({ _id: user_Id });

    const selectedAddressIndex = req.body.deliveryAddress;
    const selectedAddress = user.address[selectedAddressIndex];

    const cart = await Cart.findOne({ userid: user_Id });

    if (cart) {
        const products = [];
        let totalQuantity = 0;

        const productsWithQuantity = await Promise.all(
            cart.products.map(async (item) => {
                const productDetails = await db.findById(item.productid);
                return { productDetails, quantity: item.quantity };
            })
        );

        for (const item of productsWithQuantity) {
            products.push({
                productid: item.productDetails._id,
                product: item.productDetails.name,
                category: item.productDetails.category,
                brand: item.productDetails.brand,
                quantity: item.quantity,
                price: item.productDetails.price,
                status: "Pending", // Set the status to "Pending"
            });

            totalQuantity += item.quantity;
        }

        const newOrder = new orderDb({
            userId: user_Id,
            username: user.firstname,
            products: products,
            totalQuantity: totalQuantity,
            totalPrice: req.query.totalPrice,
            address: {
                address: selectedAddress.housename,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
            },
            paymentMethod: 'Failed Payment', // You can customize this
            orderDate: new Date(),
            deliveryDate: new Date().setDate(new Date().getDate() + 7),
            status: 'Pending', // Set the order status to "Pending"
        });

        await newOrder.save();
        console.log('New order with "Pending" status created:', newOrder);
    }

    res.redirect('/'); // Redirect to the home page or handle errors appropriately
}

const orderconfirmedPage= async(req, res) => {
        res.render("user/orderConfirmed");
    }

    const yourOrders=async(req, res) => {
        const userData = users.findOne({ email: req.session.user });
        const name = userData.firstname
        let user_id = req.session.userid;
        const order = await orderDb.find({ userId: user_id });
        const orderIds = await orderDb.find({ userId: user_id }, { _id: 1 });
        // console.log(order + "order");
        // console.log(orderIds + "orderIds");
    
        res.render("user/yourorders", {
            userId: user_id,
            orders: order,
            orderIds: orderIds,
            name: name,
            userid: user_id
        });
    }

    const addAddressGet=(req, res) => {
        const userData = users.findOne({ email: req.session.user });
        const name = userData.firstname
        const userId = req.params.user_id;
        console.log(userId);
        res.render("user/newaddress", { user_id: userId, name: name });
    }

    const addAddressSubmit=async(req, res) => {
        const userId = req.params.user_id;
        console.log(userId);
        try {
            // Find the user by ID
            const user = await users.findById(userId);
    
            // Check if the user exists
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
    
            // Extract address data from the request body
            const { housename, streetname, postoffice, city, state, pincode } =
            req.body;
    
            // Create a new address object
            const newAddress = {
                housename: housename,
                streetname: streetname,
                postoffice: postoffice,
                city: city,
                state: state,
                pincode: pincode,
            };
            console.log(newAddress);
            console.log(users.address);
            // Add the new address to the user's address array
            await user.address.push(newAddress);
    
            // Save the updated user object
            await user.save();
    
            // Optionally, redirect to another page or send a response
            res.redirect(`/placeOrder/${userId}`);
        } catch (error) {
            console.error("Error adding address:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    const addAddressget=(req, res) => {
        // const userId  = req.params.user_id;
        const userId = req.session.userid;
        console.log(userId + "sesseion");
        res.render("user/newaddresspro", { user_id: userId });
    }
    const addAddresspost=async(req, res) => {
        const userId = req.session.userid;
        console.log(userId);
        try {
            // Find the user by ID
            const user = await users.findById(userId);
    
            // Check if the user exists
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
    
            // Extract address data from the request body
            const { housename, streetname, postoffice, city, state, pincode } =
            req.body;
    
            // Create a new address object
            const newAddress = {
                housename: housename,
                streetname: streetname,
                postoffice: postoffice,
                city: city,
                state: state,
                pincode: pincode,
            };
            console.log(newAddress);
            console.log(users.address);
            // Add the new address to the user's address array
            await user.address.push(newAddress);
    
            // Save the updated user object
            await user.save();
    
            // Optionally, redirect to another page or send a response
            res.redirect("/profile");
        } catch (error) {
            console.error("Error adding address:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    const orderDetailsGet=async(req, res) => {
        let datauser = await users.findOne({ email: req.session.user });
        const user_id = datauser._id.toString();
        console.log("User ID:", user_id);
    
        const order = await orderDb
            .findOne({ userId: user_id })
            .sort({ _id: -1 })
            .limit(1);
        const orderIds = await orderDb.findOne({ userId: user_id }, { _id: 1 });
        console.log(order + "orderadddress");
        // console.log(order+"order")
    
        // console.log(orderIds+"orderIds")
    
        // res.render('user/yourorders',{userId:user_id,orders:order,orderIds:orderIds});
        res.render("user/orderDetails", {
            userId: user_id,
            orders: order,
            orderIds: orderIds,
        });
    
        // res.render("user/orderDetails",{orderDetail:order,cart: productsWithQuantity})
    }    
    const orderdetailsGet=async(req, res) => {
        const cartId = req.params.id;
        console.log(cartId);
        let datauser = await users.findOne({ email: req.session.user });
        const user_id = datauser._id.toString();
        console.log("User ID:", user_id);
    
        const order = await orderDb
            .findOne({ _id: cartId })
            .sort({ _id: -1 })
            .limit(1);
        const orderIds = await orderDb.findOne({ userId: user_id }, { _id: 1 });
        // console.log(order+"orderadddress")
        console.log(order + "order");
    
        // console.log(orderIds+"orderIds")
    
        // res.render('user/yourorders',{userId:user_id,orders:order,orderIds:orderIds});
        res.render("user/orderDetails", {
            userId: user_id,
            orders: order,
            orderIds: orderIds,
        });
    
        // res.render("user/orderDetails",{orderDetail:order,cart: productsWithQuantity})
    } 
    const cancelOrderGet=   async(req, res) => {
        const orderId = req.params.orderId;
        console.log(orderId);
    
        try {
            // Find the order by ID and update the status to "Cancellation Pending"
            const updatedOrder = await orderDb.findByIdAndUpdate(
                orderId, { $set: { status: "Cancelled" } }, { new: true }
            );
    
            if (!updatedOrder) {
                return res.status(404).send({ error: "Order not found" });
            }
            if (updatedOrder.paymentMethod === 'Net-Banking') {
                // Get the user ID from the session (assuming it's stored in req.session.userId)
                const userId = req.session.userid;
                // req.session.userid
                console.log(userId+" userId");
                // Get the user from the database
                const user = await users.findOne({ _id: userId });
                console.log(updatedOrder.totalPrice+" totalprice");
                console.log(user+"user");
                console.log(user.Wallet+"wallet");
                // Add the order amount to the user's wallet
                // if (user.Wallet) {
                    // Add the order amount to the user's wallet
                    user.Wallet += updatedOrder.totalPrice;
                    user.WalletBalance.push(updatedOrder.totalPrice)
                    // Update the user in the database
                    // await user.save();
    
                    // Add a record of wallet update
                    user.WalletUpdates.push(`Added ${updatedOrder.totalPrice} to wallet for order cancellation`);
                    await user.save();
    
                // Update the user in the database
                // await user.save();
            }
            res.redirect("/yourorders"); // Redirect to the order details page
        } 
        catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    }
    const returnOrderGet= async (req, res) => {
        const orderId = req.params.orderId;
        console.log(orderId+"orderId");
    
        try {
            // Find the order in the database and update its status
            const order = await orderDb.findById(orderId);
            console.log(order+"order");
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            // Update the order status to "Return Pending"
            order.status = 'Return Pending';
            await order.save();
    
            // Respond with a success message or additional data if needed
            // res.json({ message: 'Order status updated successfully' });
            res.redirect("/yourorders"); // Redirect to the order details page
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    const orderCancelConfirmPost=async(req, res) => {
        const orderId = req.params.orderId;
        const userId = req.session.id;
        try {
            // Find the order by ID and update the status to "Cancelled"
            const updatedOrder = await orderDb.findByIdAndUpdate(
                orderId, { $set: { status: "Cancelled" } }, { new: true }
            );
            console.log(updatedOrder + "111");
            if (!updatedOrder) {
                return res.status(404).send({ error: "Order not found" });
            }
    
            // res.render('OrdersCancelPage/${userId}', { orderId: orderId });
            res.redirect("/");
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .send({ error: "Internal Server Error" + userId + " hai " + orderId });
        }
    }
    const womenFilterGet=async(req, res) => {
        try {
            const { brand, minPrice, maxPrice } = req.body;
    
            // Construct the filter criteria based on the received data
            const filterCriteria = {};
            if (brand && brand !== "all") {
                filterCriteria.brand = brand;
            }
            if (minPrice) {
                filterCriteria.price = { $gte: minPrice };
            }
            if (maxPrice) {
                filterCriteria.price = {...filterCriteria.price, $lte: maxPrice };
            }
            // Query the database with the filter criteria
    
            const filteredProducts = await db.find(filterCriteria);
            console.log(filteredProducts + "products");
    
            res.json(filteredProducts);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    const updateUserDetails =  async(req, res) => {
        try {
            // Get the user ID from the request parameters
            const userId = req.params.userId;
            console.log(userId + "routeruserid");
            // Assuming you have a user update payload in the request body
            const { field, value } = req.body;
    
            // Update user details in the database
            const updatedUser = await users.findByIdAndUpdate(userId, {
                $set: {
                    [field]: value
                },
    
            }, { new: true }); // { new: true } returns the modified document
    
            // { new: true } returns the modified document
    
            // Check if the user was found and updated
            if (updatedUser) {
                return res.status(200).json({ success: true, message: 'User details updated successfully', user: updatedUser });
            } else {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user details:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
    const userMenPost=async (req, res) => {
        try {
            // Extract filters from the request body
            const { brand, sort, lowprice, highprice } = req.body;
                console.log(req.body+"body");
            // Apply filters to your product data
            // let filteredProducts = yourProductData;
            const filteredProducts = await db.find({ "category": "Men" })
            console.log(filteredProducts+"filteredProducts");
    
            // Filter by brand
            if (brand) {
                filteredProducts = filteredProducts.filter(product => product.brand === brand);
            }
    
            // Sort products
            if (sort === 'low-high') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sort === 'high-low') {
                filteredProducts.sort((a, b) => b.price - a.price);
            }
    
            // Filter by price range
            if (lowprice && highprice) {
                filteredProducts = filteredProducts.filter(product => product.price >= lowprice && product.price <= highprice);
            }
            console.log("hello");
            // Send the filtered products to the client
            res.json({ status: 'success', data: filteredProducts });
        } catch (error) {
            console.error('Error during product filtering:', error);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
    }

    const changePassword=async (req, res) => {
        const userId = req.params.userId;
    
        try {
            const user = await dbuser.findById(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
    
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    
            user.password = hashedPassword;
            await user.save();
    
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
module.exports = {
    loginGet,signupGet,homeGet,signupPost,productdescGet, OTPGet,OTPPost,loginPost,mensGet,mensPost,womenGet,womenPost,userLogoutGet,homesGet,
    forgotPassword,forgotPasswordSubmit,newOTP,OTPPostNew,newPassword,newPasswordSubmit,cart,wallet,addTocart,profilePage,stockCheck,
    updateQuantity,resendotp,otpvalidation, mailsender,homeAddCart,menFilterBrand,menFullFilter,menFiltercombined,addAddressPost,cartGet,checkoutpage,
    generateInvoice,wishlistget,addTocartwishlist,wishlistToggle,wishlistRemove,availableCoupons,removecart,orderCancelPageGet,orderConfirmedPage,
    orderView,placeOrderGet,placeOrderPost,paymentFailedPost,orderConfirmedPage,yourOrders,addAddressGet,addAddressSubmit,addAddressget,addAddresspost,
    orderDetailsGet,orderdetailsGet,cancelOrderGet,returnOrderGet,orderCancelConfirmPost,womenFilterGet,updateUserDetails,userMenPost,changePassword
}