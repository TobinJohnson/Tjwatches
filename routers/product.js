// products.js - Sample for products route

const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const bodyParser = require('body-parser');


// Search endpoint
router.get('/user/Mens/search', async (req, res) => {
    const { query } = req.query;
    try {
        const results = await Product.find({ $text: { $search: query } });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
});

// Sort endpoint
router.get('/products/sort', async (req, res) => {
    const { sortBy } = req.query;
    try {
        const results = await Product.find().sort(sortBy);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Sort failed' });
    }
});

router.get('/user/Mens/filter', async (req, res) => {
    const { brand, dialSize, dialShape, rating, minPrice, maxPrice } = req.body;
  
    // Construct the filter object based on the received data
    const filters = {};
  
    if (brand && brand !== 'all') {
      filters.brand = brand;
    }
    // Add conditions for other filters (dialSize, dialShape, rating, minPrice, maxPrice)
  
    try {
      // Use the filter object to query the database
      const results = await Product.find(filters);
  
      // Send the filtered results as JSON response
      res.json(results);
    } catch (error) {
      console.error('Filter error:', error);
      res.status(500).json({ message: 'Filter failed' });
    }
  });   
// Filter endpoint
// router.post('/user/Mens/filter', async (req, res) => {
//     const { filterBy } = req.query;
//     try {
//         const results = await Product.find(filterBy);
//         res.json(results);
//     } catch (error) {
//         res.status(500).json({ message: 'Filter failed' });
//     }
// });



// Pagination endpoint
router.get('/products/paginate', async (req, res) => {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    try {
        const results = await Product.find()
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Pagination failed' });
    }
});


router.post(`/user/Women/filter`, async (req, res) => {
    const { brand, minPrice, maxPrice } = req.body;
    console.log(brand)
    // Use these parameters to filter your database query
    // Query the database and send the filtered results back to the client
    // try {
       
    //     const results = await Product.find({
    //         category: 'Women',
    //         brand: brand === 'all' ? { $exists: true } : brand,
    //         price: {
    //             $gte: minPrice || 0,   // Greater than or equal to minPrice, default to 0
    //             $lte: maxPrice || 99999999  // Less than or equal to maxPrice, default to a high value
    //         }
    //     });

    //     res.json(results);
    // } catch (error) {
    //     res.status(500).json({ message: 'Filter failed' });
    // }
    const filters = req.query.filter;

    const filter = {};

    if (brand && brand !== 'all') {
        filters.brand = brand;
    }

    if (minPrice) {
        filters.price = { $gte: minPrice };
    }

    if (maxPrice) {
        filters.price = { ...filters.price, $lte: maxPrice };
    }

    try {
        // Use the filter object to query the database
        const results = await Product.find(filters.brand);

        // Send the filtered results as JSON response
        res.json(results);
    } catch (error) {
        console.error('Filter error:', error);
        res.status(500).json({ message: 'Filter failed' });
    }
});
module.exports = router;
