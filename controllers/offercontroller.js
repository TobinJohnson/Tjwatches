const express = require('express');
const offercollection = require('../models/offer')
const usercollection = require('../models/user')
const product = require('../models/products')
const category=require('../models/categories')




const viewoffer=async(req,res) => {
    try {
    const products = await product.find();
    const categories = await category.find();
    const offerscategory = await offercollection.find({ applicableCategories: { $exists: true, $ne: [] } })
    const offersproduct = await offercollection.find({ applicableProducts: { $exists: true, $ne: [] } })

    const offers = await offercollection.find().populate('applicableProducts applicableCategories');

    // console.log(offers+"offers");
    console.log(offerscategory+"categories");
    // console.log(offersproduct+"products");

    console.log("hello");
    res.render("admin/offer",{offersproduct,offerscategory,product,categories});}
    catch(err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
const addofferproductGet=async(req,res) => {
    const products = await product.find();
    const categories = await category.find();
    console.log("hello");
    res.render("admin/addofferproduct",{products})
}

const addofferproductPost = async (req, res) => {
    try {
        // Extract data from the form submission
        const { type, code, discount, startDate, endDate, applicableProducts} = req.body;
        const applicableProductsArray = Array.isArray(applicableProducts) ? applicableProducts : [applicableProducts];

        const productDetailsPromises = applicableProductsArray.map(async (productId) => {
            const products = await product.findById(productId);
            return {
                productId,      
                productName: products ? products.name : 'Product Name Not Found'
            };
        });

        // Wait for all product details promises to resolve
        const productDetails = await Promise.all(productDetailsPromises);


        // Create a new offer instance using the Offer model
        const newOffer = new offercollection({
            type,
            code,
            discount,
            startDate,
            endDate,
            applicableProducts: productDetails,

          });

        // Save the offer to the database
        const savedOffer = await newOffer.save();

        res.redirect('/offer/admin/viewoffer');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addoffercategoryPost = async (req, res) => {
    try {
        // Extract data from the form submission
        const { type, code, discount, startDate, endDate, applicableCategories } = req.body;
        const applicableCategoriesArray = Array.isArray(applicableCategories) ? applicableCategories : [applicableCategories];

        // Fetch category names based on the selected category IDs
        const categoryDetailsPromises = applicableCategoriesArray.map(async (categoryId) => {
            const categorys = await category.findById(categoryId);
            return {
                categoryId,
                categoryName: categorys ? categorys.categoryname : 'Category Name Not Found'
            };
        }); 

        // Wait for all category details promises to resolve
        const categoryDetails = await Promise.all(categoryDetailsPromises);

        // Create a new offer instance using the Offer model
        const newOffer = new offercollection({
            type,
            code,
            discount,
            startDate,
            endDate,
            applicableProducts: [], // Assuming applicableProducts is empty for now
            applicableCategories: categoryDetails,
        });

        // Save the offer to the database
        const savedOffer = await newOffer.save();

        res.redirect('/offer/admin/viewoffer');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addoffercategoryGet=async(req,res) => {
    const products = await product.find();
    const categories = await category.find();
    console.log("hello");
    res.render("admin/addoffercategory",{categories})
}
const editofferproductget=async(req,res) => {
    try {
        // Fetch categories from the database
        const categories = await category.find({_id:id});
        console.log(categories+"categories");

        // Render the editoffercategory page with the fetched categories
        res.render('admin/editoffercategory', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const editoffercategoryGet = async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await category.find();

        // Render the editoffercategory page with the fetched categories
        res.render('admin/editoffercategory', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const editoffercategoryPost = async (req, res) => {
    try {
        // Extract data from the form submission
        const { type, code, discount, startDate, endDate, applicableCategories } = req.body;

        // Update the offer in the database based on the provided ID
        const updatedOffer = await offercollection.findByIdAndUpdate(
            req.params.id, // Assuming the ID is part of the request parameters
            {
                type,
                code,
                discount,
                startDate,
                endDate,
                applicableCategories,
            },
            { new: true } // Return the modified document
        );

        // Redirect to the viewoffer page after successful update
        res.redirect('/offer/admin/viewoffer');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const editofferproductGet = async (req, res) => {
    try {
        const id = req.params.id
        // Fetch categories from the database
        const categories = await category.find({_id:id});

        // Render the editoffercategory page with the fetched categories
        res.render('admin/editoffercategory', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const editofferproductPost = async (req, res) => {
    try {
        // Extract data from the form submission
        const { type, code, discount, startDate, endDate, applicableCategories } = req.body;

        // Update the offer in the database based on the provided ID
        const updatedOffer = await offercollection.findByIdAndUpdate(
            req.params.id, // Assuming the ID is part of the request parameters
            {
                type,
                code,
                discount,
                startDate,
                endDate,
                applicableCategories,
            },
            { new: true } // Return the modified document
        );

        // Redirect to the viewoffer page after successful update
        res.redirect('/offer/admin/viewoffer');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = {
    addofferproductGet,
    addoffercategoryGet,
    addofferproductPost,
    addoffercategoryPost,
    editofferproductGet,
    editoffercategoryGet,
    editofferproductPost,
    editoffercategoryPost,

    viewoffer,
}