const express =require("express")
const user_route= express()
const session = require("express-session")
const config= require("../config/userconfig")



// user_route.use(session({secret:config.sessionSecret,
//     resave: true,
//     saveUninitialized: true}))
const usermiddleware = require("../middlewares/usermiddleware")
const usercontroller= require("../controllers/usercontroller")
const ordercontroller= require("../controllers/ordercontroller")
const productcontroller = require("../controllers/productcontroller")
const errorController = require("../controllers/errorPage")


user_route.set("view engine","ejs")
user_route.set("views","./views/user")


const smscontroller = require("../controllers/smscontroller")
const blockUser = require("../middlewares/blockUser")
const { isLogin } = require("../middlewares/adminmiddleware")




user_route.get("/",blockUser,usercontroller.homepageload)
user_route.get("/login",usermiddleware.isLogout,usercontroller.loginpageload)
user_route.get("/forgotpassword",usercontroller.forgotload)
user_route.post("/forgotpassword",usercontroller.forgotpassword)
user_route.post("/forgototp",usercontroller.forgototp)
user_route.post("/newpasswordadd",usercontroller.newpasswordadd)
user_route.get("/register",usercontroller.registerload)
user_route.post("/register",usercontroller.insertuser,usercontroller.loadotp)
user_route.post("/verifyotp",usercontroller.verifyotp)
user_route.post("/resendotp",usercontroller.insertuser,usercontroller.resendotp)
user_route.post("/login",usercontroller.verifylogin)
user_route.get("/logout",usermiddleware.isLogin,usercontroller.logoutuser)

//user_route.use(usermiddleware.isLogin)

user_route.get("/productload", blockUser,productcontroller.productload)
user_route.get("/product-details",productcontroller.productdetails)

user_route.get("/wishlistload",usermiddleware.isLogin, usercontroller.wishlistload)
user_route.get("/addwishlist",usermiddleware.isLogin,usercontroller.addwishlist)
user_route.get("/removefromwishlist",usermiddleware.isLogin,usercontroller.removefromwishlist)

user_route.get("/cartload",usermiddleware.isLogin,usercontroller.cartload)
user_route.get("/addcart",usermiddleware.isLogin,usercontroller.addcart)
user_route.post("/updatecart",usermiddleware.isLogin,usercontroller.updatecart)
user_route.get("/removefromcart",usermiddleware.isLogin,usercontroller.removefromcart)
user_route.get("/addnewaddress",usermiddleware.isLogin,usercontroller.addressNew)
user_route.post("/addnewaddress",usermiddleware.isLogin,usercontroller.newAddressAdd,usercontroller.profileload)
user_route.get("/checkoutload",usermiddleware.isLogin,usercontroller.checkoutload)
user_route.get("/editcheckoutaddress",usermiddleware.isLogin,usercontroller.editcheckoutadd);
user_route.post("/editcheckoutaddress",usermiddleware.isLogin,usercontroller.updatecheckoutadd);
user_route.get("/deletecheckoutaddress",usermiddleware.isLogin,usercontroller.delcheckoutadd)
user_route.post("/applycoupon",usermiddleware.isLogin,usercontroller.applycoupon);

user_route.get("/profileload",usermiddleware.isLogin,usercontroller.profileload);
user_route.post("/updateprofile",usermiddleware.isLogin,usercontroller.updateProfile)
user_route.post("/addaddress",usermiddleware.isLogin,usercontroller.addnewaddress);
user_route.get("/addfromcheckout",usermiddleware.isLogin,usercontroller.addfromcheckout);
user_route.get("/editaddress",usermiddleware.isLogin,usercontroller.editaddress)
user_route.post("/editaddress",usermiddleware.isLogin,usercontroller.updateaddress)
user_route.get("/deleteaddress",usermiddleware.isLogin,usercontroller.deleteaddress);
user_route.get("/listorders",usermiddleware.isLogin,ordercontroller.listorder)

user_route.post("/placeorder",usermiddleware.isLogin,ordercontroller.placeorder)
user_route.get("/onlinepayment",usermiddleware.isLogin,ordercontroller.loadordersuccess);
user_route.get("/vieworders",usermiddleware.isLogin,ordercontroller.vieworders)
user_route.get("/cancelorders",usermiddleware.isLogin,ordercontroller.cancelorders);
user_route.get("/returnorders",usermiddleware.isLogin,ordercontroller.returnorders)



user_route.get("/404error",errorController.errorPage)






module.exports= user_route