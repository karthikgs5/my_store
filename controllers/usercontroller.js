const User = require("../models/usermodel");
const mongoose = require("mongoose");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");
const product = require("../models/productmodel");
const address = require("../models/addressmodel")
const order = require("../models/ordermodel")
const coupon = require("../models/couponmodel")




require("dotenv").config();

const bcrypt = require("bcrypt");
const { db } = require("../models/usermodel");
const smscontroller = require("../controllers/smscontroller");
const session = require("express-session");
const { sendMessage } = require("fast-two-sms");

const OTP = require("otp-generator");


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
const homepageload = async (req, res) => {
  try {
    if (req.session.userLogged) {
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
      const products = await product.find({ deleted : false, isAvailable : 1})
    

      res.render("home", {
        userData: req.session.username,
        loggedIn: req.session.userLogged,
        categories: categories,
        subcategories: subcategories,
        product : products
        
      });
    } else {
      req.session.loggedIn = null;
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
      const products = await product.find({ deleted : false , isAvailable : 1})
    


      res.render("home", {
        userData: "",
        loggedIn: req.session.loggedIn,
        categories: categories,
        subcategories: subcategories,
        product : products
        
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginpageload = async (req, res) => {
  try {
    if (req.session.userLogged) {
      res.redirect("/");
    } else {
      res.render("login", { access: "You must login to continue" ,loggedIn:""});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const registerload = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

const insertuser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    const validate = await User.findOne({
      $or: [{ email: email }, { name: name }],
    });
    if (validate) {
      res.render("register", { message: "user already exist" });
    } else {
      req.newUser = {
        name: name,
        email: email,
        phone: phone,
        password: password,
      };
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadotp = async (req, res) => {
  try {
    const userData = req.newUser;
    console.log(userData);
    const phone = userData.phone;

    const otp = await smscontroller.sendMessage(phone);
    req.session.otp = otp;
    console.log(req.session.otp);
    res.render("otp", { otp: otp, userData: userData });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyotp = async (req, res) => {
  try {
    const userotp = req.body.otp;
    const serverotp = req.session.otp;
    console.log(userotp);
    console.log(serverotp);
    if (userotp == serverotp) {
      const password = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        is_admin: 0,
      });
      await user.save().then(() => console.log("registration successfull"));
      req.session.userLogged = true;
      req.session.username = user.name;
      req.session.user_id = user._id;

      res.redirect("/");
    } else {
      console.log("otp not match");
      res.render("otp", { message: "invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendotp = async (req, res) => {
  try {
    const userData = req.newUser;
    console.log(userData);

    // Check if userData exists and has phone property
    if (!userData || !userData.phone) {
      throw new Error("Invalid user data");
    }

    const phone = userData.phone;

    // generate a new OTP and store it in the session
    const newotp = await smscontroller.sendMessage(phone);
    req.session.otp = newotp;

    // send the new OTP to the user's email or phone number
    console.log(req.session.otp);
    res.render("otp", { otp: newotp, userData: userData });

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const verifylogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordmatch = await bcrypt.compare(password, userData.password);
      if (passwordmatch) {
        console.log("login sucessful");
        if (!userData.blocked) {
          req.session.username = userData.name;
          req.session.user_id = userData._id;
          req.session.userLogged = true;

          res.redirect("/");
        } else {
          res.render("login", {
            message: "you have been blocked by administrator",
            access: "",
          });
        }
      } else {
        res.render("login", { message: "password is incorrect", access: "",loggedIn:true });
      }
    } else {
      res.render("login", {
        message: "email or password are incorrect",
        access: "",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "something went wrong" });
  }
};
const forgotload = async (req, res) => {
  res.render("forgotpassword", { message: "" });
};
const forgotpassword = async (req, res) => {
  try {
    const phone = req.body.phone;
    const userData = await User.findOne({ phone: phone });
    console.log(userData);

    const otp = await smscontroller.sendMessage(phone);
    req.session.otp = otp;
    console.log(req.session.otp);
    res.render("otpforpass", { otp: otp, userData: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const forgototp = async (req, res) => {
  try {
    const userotp = req.body.otp;
    const serverotp = req.session.otp;
    console.log(userotp);
    console.log(serverotp);
    if (userotp == serverotp) {
      const password = req.body.password;
      console.log(password);

      res.render("newpassword", { oldpassword: password });
    } else {
      console.log("otp not match");
      res.render("otp", { message: "invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const newpasswordadd = async (req, res) => {
  try {
    const newpassword = await bcrypt.hash(req.body.password, 10);
    console.log(newpassword);

    const oldpassword = req.body.oldpassword;
    const user = await User.findOne({ password: oldpassword });
    user.set({ password: newpassword });
    console.log(user);
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const logoutuser = async (req, res) => {
  try {
    req.session.user_id = "";
    req.session.userLogged = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};



const wishlistload = async (req, res) => {
  try {
    if (req.session.userLogged) {
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
      const userData = await User.findById(req.session.user_id);
      const wishlistproducts = await product.find({
        _id: { $in: userData.wishlist },
      });
      console.log(wishlistproducts);
      res.render("wishlist", {
        loggedIn: req.session.userLogged,
        wishlistproducts: wishlistproducts,
        categories: categories,
        subcategories: subcategories,
      });
    } else {
      res.render("login", { access: "you must login to access the service" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addwishlist = async (req, res) => {
  try {
    if (req.session.userLogged) {
      const productid = req.query.productid;
      const categoryid = req.query.categoryid;
      const subcategoryid = req.query.subcategoryid;
      const userData = await User.findById(req.session.user_id);
      if (userData.wishlist.includes(productid)) {
        res.json({ success: false, message: 'Product already in wishlist' });
      } else {
        userData.wishlist.push(productid);
        await userData.save();
        res.json({ success: true, message: 'Product added to wishlist' });
      }
      res.redirect(
        `/productload?categoryid=${categoryid}&subcategoryid=${subcategoryid}&addedtowishlist=true`
      );
    } else {
      res.render("login", { access: "you must login to access the service" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const removefromwishlist = async (req, res) => {
  try {
    const productid = req.query.productid;
    const userData = await User.findById(req.session.user_id);
    if (userData.wishlist.includes(productid)) {
      await User.updateOne(
        { _id: req.session.user_id },
        { $pull: { wishlist: productid } }
      );
      console.log("Product removed from wishlist successfully!");
    }
    res.redirect("/wishlistload");
  } catch (error) {
    console.log(error.message);
  }
};

const cartload = async (req, res) => {
  try {
    if (req.session.userLogged) {
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
      const userData = await User.findById(req.session.user_id);
      const cartproducts = await userData.populate("cart.item.productId");
      // console.log(cartproducts)

      res.render("cart", {
        loggedIn: req.session.userLogged,
        categories: categories,
        subcategories: subcategories,
        cartproducts: cartproducts.cart,
      });
    } else {
      res.render("login", { access: "you must login to access the service" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addcart = async (req, res) => {
  try {
    if (req.session.userLogged) {
      const productId = req.query.productid;
      const fromwishlist = req.query.boolean;
      console.log(fromwishlist);

      const userData = await User.findById(req.session.user_id);
      const productdata = await product.findById(productId);

      // Check if the product is out of stock
      if (productdata.stock <= 0) {
        console.log("out of stock");
        res.json({ success: false, message: "Product is out of stock" });
        return;
      }

      // Check if the product is already in the cart
      const cartItem = userData.cart.item.find((item) =>
        item.productId.equals(productId)
      );

      if (fromwishlist) {
        userData.wishlist = userData.wishlist.filter(
          (wish) => !wish.equals(productId)
        );
        if (cartItem) {
          // If the product is already in the cart, increase the quantity
          console.log("vanno");
          // Remove the product from the wishlist
          
          await userData.save();
          
          res.json({
            success: false,
            message: "Product already in cart",
          });
        }else{
          const itemprice = productdata.price;
          userData.cart.item.push({
            productId,
            quantity: 1,
            price: itemprice,
          });

          productdata.stock -=1;

  
          //calculate total price
          userData.cart.totalprice += itemprice;
          await userData.save();
          await productdata.save();
  
          res.json({ success: true, message: "Product added in cart" });

        }
        


       
      }
      else{

      if (cartItem) {
        // If the product is already in the cart, increase the quantity
        if (cartItem.quantity + 1 > productdata.stock) {
          res.json({
            success: false,
            message: "Product stock exceeded",
          });
          return;
        }
        cartItem.quantity += 1;
        cartItem.price += productdata.price;
        userData.cart.totalprice += productdata.price;
        await userData.save();

        res.json({
          success: true,
          message: "Product quantity increased in cart",
        });
      } else {
        // If the product is not in the cart, add it
        const itemprice = productdata.price;
        userData.cart.item.push({
          productId,
          quantity: 1,
          price: itemprice,
        });
        productdata.stock -=1;

        //calculate total price
        userData.cart.totalprice += itemprice;
        await userData.save();
        await productdata.save();

        res.json({ success: true, message: "Product added in cart" });
      }
    } 
  }else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const updatecart = async (req, res) => {
  try {
    console.log("thisss");
    let { Quantity, _id } = req.body;
    console.log(Quantity);
    console.log(_id);
    console.log("hi");

    const userData = await User.findById(req.session.user_id);
    const productData = await product.findById(_id);
    const price = productData.price;
    console.log(Quantity);

    let test = await userData.updatecart(_id, Quantity);
    console.log(test);

    res.json({ test, price });
  } catch (error) {
    console.log(error);
  }
};
const removefromcart = async (req, res) => {
  try {
    const productId = req.query.productid;
    console.log(productId);
    const userData = await User.findById(req.session.user_id);
    console.log(userData);
    userData.removefromcart(productId);
    res.redirect("/cartload");
  } catch (error) {
    console.log(error);
  }
};
const checkoutload= async(req,res)=>{
  try{
    const userData = req.session.user_id
    const useraddress = await address.find({userId:userData})
    const userdetails = await User.findById({_id:userData})
    const usercart = await userdetails.populate("cart.item.productId")
    const coupondata = await coupon.find({isAvailable:1})
    console.log(coupondata);
    const categories = await category.find({ deleted: false });
    const subcategories = await subcategory.find({ deleted: false });

    res.render("ch",{
      loggedIn:req.session.userLogged,
      user:req.session.username,
      address:useraddress,
      checkoutdetails:usercart.cart,
      coupon: coupondata,
      wallet: userdetails.wallet,
      categories:categories,
      subcategories:subcategories


    })
  }
  catch (error) {
    console.log(error.message);
}
}
const applycoupon = async (req, res) => {
  try {
      const totalprice = req.body.totalValue;
      console.log("total" + totalprice);
      console.log(req.body.coupon);
      userdata = await User.findById({ _id: req.session.user_id });
      offerdata = await coupon.findOne({ name: req.body.coupon });
      console.log(offerdata);
      console.log('fghdj');
      if (offerdata) {
          console.log('p333');
          console.log(offerdata.expirydate, Date.now());
          const date1 = new Date(offerdata.expirydate);
          const date2 = new Date(Date.now());
          if (date1.getTime() > date2.getTime()) {
              console.log('p4444');
              if (offerdata.usedby.includes(req.session.user_id)) {
                  messag = 'coupon already used'
                  console.log(messag);
              } else {
                  console.log('eldf');
                  console.log(userdata.cart.totalprice, offerdata.maximumvalue, offerdata.minimumvalue);
                  if (userdata.cart.totalprice >= offerdata.minimumvalue) {
                      console.log('COMMING');
                      console.log('offerdata.name');
                      await coupon.updateOne({ name: offerdata.name }, { $push: { usedBy: userdata._id } });
                      console.log('kskdfthg');
                      disc = (offerdata.discount * totalprice) / 100;
                      if (disc > offerdata.maximumvalue) {
                         disc = offerdata.maximumvalue
                         }
                      console.log(disc);
                      res.send({ offerdata, disc, state: 1 })
                  } else {
                      messag = 'cannot apply'
                      res.send({ messag, state: 0 })
                  }
              }
          } else {
              messag = 'coupon Expired'
              res.send({ messag, state: 0 })
          }
      } else {
          messag = 'coupon not found'
          res.send({ messag, state: 0 })
      }
      res.send({ messag, state: 0 })
  }

  catch (error) {
      console.log(error.message);
  }
}

const profileload =async (req,res)=>{
  try {
      const userid =req.session.user_id;
      const user=await User.findOne({_id:userid});
      const addid= await address.find({userId:userid})

      const orderdata=await order.find({userId:userid}).sort({createdAt:1}).populate("products.item.productId");
     
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
      res.render("userProfile",{ 
        loggedIn: req.session.userLogged,
        user:req.session.username,
        useraddress:addid,
        userData:user,
        order:orderdata,
        categories:categories,
        subcategories:subcategories
      })
  } catch (error) {
      console.log(error.message);
  }
  }
 const updateProfile = async (req,res) => {
  try {
    const name = req.body.name
    const email = req.body.email
    const bio = req.body.bio
    const mobile = req.body.mobile

    const user = await User.findByIdAndUpdate(
      {
        _id : req.session.user_id
      },
      {
        $set :{
          name : name,
          email : email,
          bio : bio,
          phone : mobile          
        }
      }
    )
    user.save()
    console.log("user Updated");
    res.redirect("/profileload")

    
  } catch (error) {
    console.log(error.message);
  }
 }






  const addnewaddress=async(req,res)=>{
    try {
      const hidden = req.body.hidden;
      console.log("hehe");
      console.log(req.body.address)
        const newAddress = new address({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          phone: req.body.phone,
          email: req.body.email,
          userId: req.session.user_id
        })
        const newaddress =await newAddress.save();
        if(newaddress&&hidden){
            res.redirect("/profileload");
        }else{
          res.redirect("/checkoutload")
        }
    } catch (error) {
      console.log(error.message)
        
    }
}
const addfromcheckout =async(req,res)=>{
try{
  const categories = await category.find({ deleted: false });
  const subcategories = await subcategory.find({ deleted: false });

  res.render("addressfromcheck",{
    user:req.session.username,
    loggedIn:req.session.userLogged,
    categories:categories,
    subcategories:subcategories

  })

}catch(error){
  console.log(error.message);
}

}



const  addressNew = async(req,res) => {
  try {
    const categories = await category.find({ deleted: false });
  const subcategories = await subcategory.find({ deleted: false });


  res.render("newaddress",{
    user:req.session.username,
    loggedIn:req.session.userLogged,
    categories:categories,
    subcategories:subcategories

  })
    
  } catch (error) {
    console.log(error.message);
  }
}

 const newAddressAdd = async (req,res, next) => {
  try {

    const newAddress = new address({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      phone: req.body.phone,
      email: req.body.email,
      userId: req.session.user_id
    })
    newAddress.save()
    
    next()
  } catch (error) {
    console.log(error.message);
  }
 }



const editaddress = async(req,res)=>{
  try{
    const id=req.query.id;
    const add= await address.findOne({_id:id})
    const categories = await category.find({ deleted: false });
    const subcategories = await subcategory.find({ deleted: false });
   res.render("editaddress",{
    user:req.session.username,
    loggedIn:req.session.userLogged,
    address:add,
    categories:categories,
    subcategories:subcategories
    
  });

  }
  catch(error){
    console.log(error.message);
  }

}
const updateaddress =async(req,res)=>{
  try {
      const id=req.body.id;
      console.log(id);
      const upadteAddress =await address.findByIdAndUpdate({_id:id},{$set:{
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          country:req.body.country,
          address:req.body.address,
          city:req.body.city,
          zip:req.body.zip,
          phone:req.body.phone
      }})
      console.log(upadteAddress);
     res.redirect("/profileload")
  } catch (error) {
      console.log(error.message);
  }
}

const deleteaddress =async(req,res)=>{
  try {
      const id=req.query.id;
      const Address=await address.deleteOne({_id:id});
      if(Address){
          res.redirect("/profileload");
      }
  } catch (error) {
      console.log(error.message);
  }
  }
  const editcheckoutadd =async(req,res)=>{
    try {
        const id=req.query.id;
        const addressdata=await address.findById({_id:id});
        const categories = await category.find({ deleted: false });
        const subcategories = await subcategory.find({ deleted: false });
        res.render("editcheckoutadd",{
          user:req.session.username,
          loggedIn:req.session.userLogged,
          address:addressdata,
          categories:categories,
          subcategories:subcategories

        });
    } catch (error) {
        console.log(error.message);
    }
}

const updatecheckoutadd =async(req,res)=>{
    try {
        const id=req.body.id;
        console.log(id);
        const upadteAddres =await address.findByIdAndUpdate({_id:id},{$set:{
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            country:req.body.country,
            address:req.body.address,
            city:req.body.city,
            zip:req.body.zip,
            phone:req.body.phone
        }})
        console.log(upadteAddres);
       res.redirect("/checkoutload")
    } catch (error) {
        console.log(error.message);
    }
}

const delcheckoutadd=async(req,res)=>{
    try {
        const id=req.query.id;
        const deleteAddress= await address.findByIdAndDelete({_id:id})
        res.redirect("/checkoutload")
    } catch (error) {
        
    }
}






module.exports = {
  securePassword,
  homepageload,
  loginpageload,
  registerload,
  insertuser,
  verifylogin,
  logoutuser,
  loadotp,
  verifyotp,
  resendotp,
  forgotload,
  forgotpassword,
  wishlistload,
  addwishlist,
  removefromwishlist,
  forgototp,
  newpasswordadd,
  cartload,
  addcart,
  updatecart,
  removefromcart,
  checkoutload,
  applycoupon,
  profileload,
  addnewaddress,
  editaddress,
  updateaddress,
  deleteaddress,
  editcheckoutadd,
  updatecheckoutadd,
  delcheckoutadd,
  addfromcheckout,
  addressNew,
  newAddressAdd,
  updateProfile
 
  
};
