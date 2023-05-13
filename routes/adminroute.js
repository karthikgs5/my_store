const express =require("express")
const admin_route= express()
const session = require("express-session")
const config= require("../config/adminconfig")
// admin_route.use(session({secret:config.sessionSecret,
//     resave: true,
//     saveUninitialized: true}))
const adminmiddleware = require("../middlewares/adminmiddleware")
const admincontroller= require("../controllers/admincontroller")
const ordercontroller= require("../controllers/ordercontroller")
const productcontroller = require("../controllers/productcontroller")
const catcontroller = require("../controllers/catcontroller")   
const subcatcontroller = require("../controllers/subcatcontroller")
const couponcontroller = require("../controllers/couponcontroller")

const multer = require('multer');
const path = require('path')



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/admin/product')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });




admin_route.set("view engine","ejs")
admin_route.set("views","./views/admin")
admin_route.use(express.static('public'));


admin_route.get("/",adminmiddleware.isLogout,admincontroller.loginpageload)

admin_route.post('/',admincontroller.verifylogin);

admin_route.use(adminmiddleware.isLogin)


admin_route.get('/dashboard',adminmiddleware.isLogin,admincontroller.loaddashboard);


admin_route.get('/showusers',adminmiddleware.isLogin,admincontroller.userload)
admin_route.get("/blockuser",admincontroller.blockuser)
admin_route.get("/logout",adminmiddleware.isLogin,admincontroller.logout)

admin_route.get("/categories",catcontroller.loadcategories)
admin_route.post("/categories",catcontroller.createcategory)
admin_route.get("/editcategory",catcontroller.editcategoryload)
admin_route.post("/editcategory",catcontroller.editcategory)
admin_route.get("/deletecategory",catcontroller.deletecategory)

admin_route.get("/subcategories",subcatcontroller.loadsubcategories)
admin_route.post("/subcategories",subcatcontroller.createsubcategory)
admin_route.get("/editsubcategory",subcatcontroller.editsubcategoryload)
admin_route.post("/editsubcategory",subcatcontroller.editsubcategory)
admin_route.get("/deletesubcategory",subcatcontroller.deletesubcategory)

admin_route.get("/addproduct",productcontroller.addproduct)
admin_route.post("/addproduct",upload.array("productpic",4),productcontroller.addproductprocess)
admin_route.get("/showproducts",productcontroller.showproducts)
admin_route.get("/editproduct",productcontroller.editproductload)
admin_route.post("/editproduct",upload.array("productpic",4),productcontroller.editproduct)
admin_route.get("/deleteproduct",productcontroller.deleteproduct)
admin_route.post("/deleteimage",productcontroller.deleteimage)
admin_route.get("/updateproduct",productcontroller.updateProduct)
admin_route.get("/couponload",couponcontroller.couponload)
admin_route.post("/addcoupon",couponcontroller.addcoupon)
admin_route.get ("/editcouponload",couponcontroller.editcouponload)
admin_route.post("/editcoupon",couponcontroller.editcoupon)
admin_route.get("/deletecoupon",couponcontroller.deletecoupon)
admin_route.get("/availcoupon",couponcontroller.availablecoupon)

admin_route.get("/ordersload",ordercontroller.ordersload)
admin_route.get("/vieworderdetails",ordercontroller.vieworderdetails)
admin_route.post('/updateorder',ordercontroller.sortorder)
admin_route.post("/updatestatus",ordercontroller.updatestatus);
admin_route.get("/salesreport",admincontroller.salesReport)





admin_route.get('*',(req,res)=>{
    res.redirect('/admin');
});

module.exports= admin_route