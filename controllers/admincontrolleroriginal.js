const db = require('../models/products');
const dbuser = require('../models/user');
const mongoose=require("mongoose");
const dbadmin=require('../models/admindetails');
const dbcategory=require('../models/categories');
const users=require('../models/user');
const orderDb=require('../models/orderDb')
const PDFDocument = require("pdfkit-table");
const ExcelJS = require("exceljs");
const multer=require('multer')



// Unique Id Generator Function
function generateUniqueID() {
  // Generate a random four-digit number
  let id = Math.floor(100 + Math.random() * 900);
  // Prepend "USR" to the id
  return "TJ" + id;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('images');




function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
const   loginGet=(req, res) => {
  let adminuser = req.session.adminUser;
  console.log(adminuser);
  if (adminuser) { 
    res.redirect('/admin/dashboard')
  } else {
    res.render('admin/login');
  }
    
   }


const loginPost=async(req, res) => {
  console.log(req.body)
  try {
    if (!req.body.email.trim() || !req.body.password.trim()) {
      return res.render('admin/login', {
        email: req.body.email.trim() ? '' : 'Email is required.',
        password: req.body.password.trim() ? '' : 'Password is required.',
      });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(req.body.email.trim())) {
      return res.render('admin/login', {
        email: 'Invalid email format.',
        password: '',
      });
    }
    const credential = await dbadmin.findOne({email: req.body.email});
    console.log(credential)
    if(credential){
      if (req.body.email === credential.email && req.body.password === credential.password) {
        console.log('Login successful');
        req.session.adminUser = credential.email;
        req.session.adminid=credential._id
        // console.log(req.session.adminUser);
  
        res.redirect('/admin/dashboard')
      } else if(!req.body.email === credential.email){
        res.render('admin/login', {
          email: 'Login failed. Incorrect email !!',
        });
      }else{
        res.render('admin/login', {
          password: 'Login failed. Incorrect password!!',
        });
      }
    }
    else{
      res.render('admin/login', {
        noemail: 'Login failed. Email not found.',
      });
    }
  } catch (error) {
    console.log('error while post:', error);
  }
}
 //   res.redirect('/admin/dashboard');
 // }  
  
const dashboardGet=async(req, res) => {

  try {

 // Get all orders
 const allOrders = await orderDb.find({});

 // Calculate Total Revenue
 const totalRevenue = allOrders.reduce((acc, order) => acc + order.totalPrice, 0);

 // Calculate Total Profit (assuming profit is 15% of total revenue)
 const totalProfit = 0.15 * totalRevenue;
 const orders = await orderDb.find(); // Update with your actual query
 const chartData = {
  // dates: orders.map(order => order.orderDate), // Assuming 'createdAt' is the order creation date
  revenue: orders.map(order => order.totalPrice),
  profit: orders.map(order => (order.totalPrice)*.15),
};
console.log(chartData.revenue+"chartdata");
 // Transform data for the chart
//  const chartData = {
//   dates: orders.map(order => order.orderDate.toISOString()),
//   revenue: orders.map(order => order.revenue),
//   profit: calculateProfit(orders),
// };
function calculateProfit(orders) {
  return orders.map(order => {
    // Assuming 'totalPrice' is available in the order schema
    const revenue = order.totalPrice;

    // Calculate profit as 15% of revenue
    const profit = 0.15 * revenue;

    return profit;
  });
}

    // Daily Orders
    const dailyOrders = await orderDb.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
      (result, order) => {
        result.dates.push(order._id);
        result.orderCounts.push(order.orderCount);
        result.totalOrderCount += order.orderCount;
        return result;
      },
      { dates: [], orderCounts: [], totalOrderCount: 0 }
    );
    // monthly
    const monthlyOrders = await orderDb.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const monthlyData = monthlyOrders.reduce((result, order) => {
      const monthYearString = `${order._id.year}-${String(
        order._id.month
      ).padStart(2, "0")}`;
      result.push({
        month: monthYearString,
        orderCount: order.orderCount,
      });
      return result;
    }, []);
    let monthdata = orderCounts;

    //  Yearly Order
    const yearlyOrders = await orderDb.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$orderDate" } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
      (result, order) => {
        result.years.push(order._id);
        result.orderCounts3.push(order.orderCount);
        result.totalOrderCount3 += order.orderCount;
        return result;
      },
      { years: [], orderCounts3: [], totalOrderCount3: 0 }
    );

    res.render("admin/dashboard", {
      dates,
      orderCounts,
      totalOrderCount,
      monthdata,
      years,
      orderCounts3,
      totalOrderCount3,
      totalRevenue,
      totalProfit,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching and aggregating orders:", error);
    res.status(500).send("Internal Server Error");
  }
};

  
  const newproductGet=(req, res) => {
    res.render('admin/newproduct');
  }



const deleteUserGet=async(req, res) => {
 
    try {
      const productId = req.params.id;
  
      const product = await db.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Toggle the isDeleted status
    product.isDeleted = !product.isDeleted;

    // Save the updated product
    const updatedProduct = await product.save();

    res.redirect('/admin/product');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
     } 
     const userUpdateGet= async(req, res) => {
 
        try {
          const userId = req.params.id;
      
          const userinfo = await dbuser.findById(userId)
          //   { $set: { isBlocked: !req.params.isBlocked} },
          //   { new: true }
          // );
      


          if (!userinfo) {
            return res.status(404).json({ message: 'User not found' });
              }

          // Toggle the isBlocked field
          userinfo.isBlocked = !userinfo.isBlocked;

          // Save the updated user
          const updatedUser = await userinfo.save();



          res.redirect('/admin/edituser');
            } catch (error) {
          console.log(error);
          res.status(500).send('Internal Server Error');
            }
         }

    const unblockUserGet= async(req, res) => {
 
        try {
          const userId = req.params.id;
      
          const updatedUser = await dbuser.findByIdAndUpdate(
            userId,
            { $set: { isBlocked: false} },
            { new: true }
          );
      
          if (!updatedUser) {
            return res.status(404).send('User not found');
          }
    
          res.redirect('/admin/edituser');
            } catch (error) {
          console.log(error);
          res.status(500).send('Internal Server Error');
         }
         }
    const productGet= async(req, res) => {
        const productdatadetails = await db.find();
        console.log(productdatadetails)
            res.render('admin/product',{productdatadetails});
          }
    const addproductGet= async(req, res) => {
      const categorydetails=await dbcategory.find({})
        res.render('admin/addproduct',{categorydetails});
        console.log(categorydetails)
      }  
    const addCategoryGet=async(req, res) => {
        const categorydetails=await dbcategory.find({})
        console.log(categorydetails)
        res.render('admin/viewcategory',{categorydetails});
      }    
      const addCategoryPost=async(req, res) => {
        console.log("entered in addcategory post");
        const category = req.body.categoryname;

  try {
    // Check if the category already exists (case-insensitive)
    const existingCategory = await dbcategory.findOne({
      category: { $regex: new RegExp("^" + category + "$", "i") },
    });

    if (existingCategory) {

      console.log("Category already exists:", category);

      return res.redirect("/admin/addcategory");
    }
    const categorydata=await dbcategory.insertMany(category)
    console.log(categorydata)
   
    res.redirect("/admin/addcategory");
  } catch (error) {
    // Handle the error (e.g., show an error message)
    console.error("Error adding category:", error);
    res.redirect("/admin/addcategory");
  }

      }    
    const editUserGet=async(req, res) => {
      const user_Id = req.session.userid;

        const userdatadetails = await dbuser.find();
        const address = await dbuser.find({},{address:1,_id:0});

        // const address=userdatadetails.address
        
        // console.log(userdatadetails+"userdetails")
        // console.log(address[0].housename+"address")
          console.log(address+"address")
          // console.log(addressData.address+"address")




        res.render('admin/edituser',{userdatadetails,address});
      }  
      const categoryGet=async(req, res) => {
        const categorydetails = await dbcategory.find();
        res.render('admin/cat',{categorydetails});
      }  
    const addProductPost=async(req, res) => {
        console.log("Entered Add Product Post");
        const { Productname, Category, Price, Rating, Model, Description, Stock } =
    req.body;
      
        const data = {
          category:req.body.category,
          description:req.body.description,
          name: req.body.name,
          price: req.body.price,
          rating: req.body.rating,
          brand:req.body.brand,
          size:req.body.size,
          // strapcolor:req.body.strapcolor,
          dialshape:req.body.dialshape,
          quantity:req.body.quantity,
          images: req.files.map(file => file.path)
          // isDeleted:false
        }
        console.log(data)
        const productdata=await db.insertMany([data])
        .then(x=>{
          res.redirect('/admin/dashboard')
        }).catch(x=>{
          console.log('error',x);
          res.status(500).send('Internal Server Error');

        })      
      } 
      
        const updateProductGet=async (req, res) => {
            try {
              const productid = await req.params.id
              console.log(productid)
            const dataproduct = await db.findById(productid)
            console.log(dataproduct)
            res.render('admin/updateproduct',{dataproduct,productid})
            } catch (error) {
              res.render('admin/error');
            }
          }

     
        const updateProductPost = async (req, res) => {
          try {
            const id = req.params.id;
        
            // Fetch the existing document
            const existingProduct = await db.findById(id);
        
            // Update only the fields that are present in req.body
            if (req.body.category) existingProduct.category = req.body.category;
            if (req.body.description) existingProduct.description = req.body.description;
            if (req.body.name) existingProduct.name = req.body.name;
            if (req.body.price) existingProduct.price = req.body.price;
            if (req.body.rating) existingProduct.rating = req.body.rating;
            if (req.body.brand) existingProduct.brand = req.body.brand;
            if (req.body.size) existingProduct.size = req.body.size;
            if (req.body.strapcolor) existingProduct.strapcolor = req.body.strapcolor;
            if (req.body.dialshape) existingProduct.dialshape = req.body.dialshape;
            if (req.body.quantity) existingProduct.quantity = req.body.quantity;
        
            // Update images only if new files are uploaded
            if (req.files && req.files.length > 0) {
              existingProduct.images = req.files.map(file => file.path);
            }
        
            // Save the updated document
            const updatedProduct = await existingProduct.save();
            
            console.log(updatedProduct);
            res.redirect("/admin/product");
          } catch (error) {
            console.log(error);
            // Handle the error and send an appropriate response
            res.status(500).send("Internal Server Error");
          }
        };
          
          
         const adminLogoutGet= (req, res) => {
           console.log(req.session.adminUser)
            req.session.destroy(function(err){
              if(err) {
                console.log(err);
                res.render('error');
              } else {
              res.redirect('/admin/login')
              , {
                logout: "Logout Successfully...!"
              } }
            })}

            const viewcategory = async (req, res) => {
              try {
                const category=await dbcategory.find()
                console.log(category)
                await dbcategory.find()
                  .then(x => {
                    res.render('admin/viewcategory', {category:x})
                  })
            
              } catch (error) {
                console.log(error);
              }
            }
            const categoryadding=async(req, res) => {
              // const userdatadetails = await dbuser.find();
              res.render('admin/categoryadding');
            }  
            const categoryaddpost = async (req, res) => {
              try {
                const cat = { categoryname: req.body.categoryname };
                console.log(cat);
                const existingCategory = await dbcategory.findOne({ categoryname: { $regex: new RegExp('^' + cat.categoryname + '$', 'i') } });
                if (existingCategory) {
                  res.render('admin/categoryadding', { message: "Category already exists" });
                } else {
                  const value = await dbcategory.insertMany([cat]);
                  console.log(value);
                  if (!value) {
                    res.render('admin/categoryadding', { message: "Not inserted" });
                  } else {
                    res.redirect('/admin/category');
                  }
                }
              } catch (error) {
                console.log(error);
              }
            }

            const deletecategory = async (req, res) => {

              try {
                console.log('enter the deletepost');
                const id = req.params.id;
                const result = await dbcategory.findByIdAndDelete(id);
            
                if (result) {
                  console.log('enter the deletecat');
                  res.redirect('/admin/category')
                  // .then(x=>{
                  //   res.render('viewcategory',{catlist:x})})
            
                }
                else {
                  res.json({ msg: 'User not found' });
                }
            
              } catch (err) {
                console.error('Error deleting user: ', err);
                res.json({ msg: err.message });
              }
            }





            const categoryupdateget = async (req, res) => {

              try {
                const id = req.params.id
                const category=  await dbcategory.findById(id)
                console.log(category);
                await dbcategory.findById(id)
                  .then(x => {
                    console.log(x);
                    res.render('admin/updatecategory',{category:category})
                  })
              } catch (error) {
                console.log(error);
              }
            }
            
            //category update post request
            const categoryupdatepost = async (req, res) => {
  try {
     const id = req.params.id
                const category=  await dbcategory.findById(id)
    const cat = { categoryname: req.body.categoryname };
    const existingCategory = await dbcategory.findOne({
      categoryname: { $regex: new RegExp('^' + cat.categoryname + '$', 'i') }
    });

    if (existingCategory) {
      res.render('admin/updatecategory', { category:category,message: "Category already exists" });
    } else {
      const id = req.params.id;

      await dbcategory.findByIdAndUpdate(id, {
        categoryname: req.body.categoryname
      });

      res.redirect('/admin/category');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


            const orderDetails=async(req, res) => {
              // const userdatadetails = await dbuser.find();
              // let user_id=req.session.userid
              // console.log(user_id)
              let admin_id = req.session.adminid;
              console.log(admin_id)


              const order = await orderDb.find()
              const orderId = await orderDb.find({},{_id:1})
              console.log(order+"order")
              // console.log(orderId+"orderIds")
                console
              res.render('admin/orderdetails',{orders:order,orderIds:orderId});
            }  
            const salesPdf = async (req, res) => {
              try {
                const startingDate = new Date(req.query.startingdate);
                const endingDate = new Date(req.query.endingdate);
            
                // Fetch orders within the specified date range
                const orders = await orderDb.find({
                  orderDate: { $gte: startingDate, $lte: endingDate },
                });
            
                // Create a PDF document
                const doc = new PDFDocument();
                const filename = "sales_report.pdf";
            
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.setHeader("Content-Type", "application/pdf");
            
                doc.pipe(res);
            
                // Add content to the PDF document
                doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
            
                // Define the table data
                const tableData = {
                  headers: [
                    "Username",
                    "Product Name",
                    "Price",
                    "Quantity",
                    "Address",
                    "City",
                    "Pincode",
                    "State",
                  ],
                  rows: orders.map((order) => [
                    order.username,
                    order.products.map((product) => product.product).join(", "),
                    order.products.map((product) => product.price).join(", "),
                    order.products.map((product) => product.quantity).join(", "),
                    order.address.address,
                    order.address.city,
                    order.address.pincode,
                    order.address.state,
                  ]),
                };
            
                // Draw the table
                await doc.table(tableData, {
                  prepareHeader: () => doc.font("Helvetica-Bold"),
                  prepareRow: () => doc.font("Helvetica"),
                });
            
                // Finalize the PDF document
                doc.end();
              } catch (error) {
                console.error("Error generating PDF:", error);
                res.status(500).send("Internal Server Error");
              }
            };
            const excelReport = async (req, res) => {
              try {
                console.log("Excel");
            
                const startdate = new Date(req.query.startingdate);
                const Endingdate = new Date(req.query.endingdate);
                console.log(startdate);
                console.log(Endingdate);
                Endingdate.setDate(Endingdate.getDate() + 1);
            
                const orderCursor = await orderDb.aggregate([
                  {
                    $match: {
                      orderDate: { $gte: startdate, $lte: Endingdate },
                    },
                  },
                ]);
                console.log(orderCursor);
                if (orderCursor.length === 0) {
                  return res.redirect("/admin/dashboard");
                }
            
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Sheet 1");
            
                // Add data to the worksheet
                worksheet.columns = [
                  { header: "Username", key: "username", width: 15 },
                  { header: "Product Name", key: "productname", width: 20 },
                  { header: "Quantity", key: "quantity", width: 15 },
                  { header: "Price", key: "price", width: 15 },
                  { header: "Status", key: "status", width: 15 },
                  { header: "Order Date", key: "orderdate", width: 18 },
                  { header: "Address", key: "address", width: 30 },
                  { header: "City", key: "city", width: 20 },
                  { header: "Pincode", key: "pincode", width: 15 },
                  { header: "State", key: "state", width: 15 },
                ];
            
                for (const orderItem of orderCursor) {
                  // Fetch address details based on the address ID
            
                  worksheet.addRow({
                    username: orderItem.username,
                    productname: orderItem.products
                      .map((product) => product.product)
                      .join(", "),
                    quantity: orderItem.totalQuantity,
                    price: orderItem.totalPrice,
                    status: orderItem.products.map((product) => product.status).join(", "),
                    orderdate: orderItem.orderDate,
                    address: orderItem.address.address,
                    city: orderItem.address.city,
                    pincode: orderItem.address.pincode,
                    state: orderItem.address.state,
                  });
                }
            
                // Generate the Excel file and send it as a response
                workbook.xlsx.writeBuffer().then((buffer) => {
                  const excelBuffer = Buffer.from(buffer);
                  res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  );
                  res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
                  res.send(excelBuffer);
                });
              } catch (error) {
                console.error("Error creating or sending Excel file:", error);
                res.status(500).send("Internal Server Error");
              }
            };
            
            const salesReport = async (req, res) => {
              const orders = await orderDb.find();
              res.render("admin/salesReport", { orders,generateUniqueID });
            };
            
            // Sales Report Search Get
            exports.search = async (req, res) => {
              const searchQuery = req.query.search;
              const regexPattern = new RegExp(`^${searchQuery}`, "i");
            
              const filteredOrder = await orderDb.find({
                username: { $regex: regexPattern },
              });
              res.json(filteredOrder);
            };
  module.exports={loginGet,loginPost,dashboardGet,deleteUserGet,
                userUpdateGet,unblockUserGet,productGet,addproductGet,
                addCategoryGet,addCategoryPost,editUserGet,addProductPost,updateProductGet,
                updateProductPost,adminLogoutGet,newproductGet,categoryGet,viewcategory,
                categoryadding,categoryaddpost,deletecategory,categoryupdateget,
                categoryupdatepost,orderDetails,salesPdf,excelReport,salesReport} 