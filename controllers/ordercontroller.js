const product = require("../models/productmodel");
const address = require("../models/addressmodel");
const order = require("../models/ordermodel");
const User = require("../models/usermodel");
//const coupon = require("../models/couponmodel")
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");
const Razorpay = require("razorpay");
require("dotenv").config();

let newOrder;
var newAddress;
const placeorder = async (req, res) => {
  try {
    console.log(req.body.address);
    if (req.body.payment === undefined || req.body.amount === "0") {
      res.redirect("/checkoutload");
    }

    if (req.body.address === undefined) {
      newAddress = new address({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.details,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
        email: req.body.email,
      });
    } else {
      console.log(req.body.address);
      newAddress = await address.findOne({ _id: req.body.address });

      console.log(newAddress);
    }
    const userData = await User.findOne({ _id: req.session.user_id });
    newOrder = new order({
      userId: req.session.user_id,
      address: newAddress,
      payment: {
        method: req.body.payment,
        amount: req.body.amount,
      },
      offer: req.body.coupon,
      products: userData.cart,
    });
    console.log(newOrder);
    console.log("hellohi");

    if (req.body.payment == "COD") {
      console.log("hello");
      console.log(newOrder.payment.amount);
      await newOrder.save();
      const productdata = await product.find();
      for (let key of userData.cart.item) {
        for (let prod of productdata) {
          if (
            new String(prod._id).trim() == new String(key.productId._id).trim()
          ) {
            prod.stock = prod.stock - key.quantity;
            await prod.save();
          }
        }
      }

      await User.updateOne(
        { _id: req.session.user_id },
        { $unset: { cart: 1 } }
      );
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });

      res.render("ordersuccess", {
        user: req.session.username,
        loggedIn: req.session.userLogged,
        categories: categories,
        subcategories: subcategories,
        orders: newOrder,
      });
    } else if (req.body.payment == "wallet") {
      console.log("123");
      let walletAmount = parseInt(req.body.walamount);
      let totalAmount = parseInt(req.body.cost);
      req.session.totalWallet = walletAmount;
      console.log(req.session.totalWallet);
      if (walletAmount >= totalAmount) {
        console.log("asdfdgadgadg");
        await newOrder.save();
        let userWallet = await User.findOne({ _id: req.session.user_id });
        let minusAmt = userWallet.wallet - req.body.cost;
        let minuswalAmt = await User.updateOne(
          { _id: req.session.user_id },
          { $set: { wallet: minusAmt } }
        );
        console.log(minuswalAmt);
        await User.updateOne(
          { _id: req.session.user_id },
          { $unset: { cart: 1 } }
        );

        const productdata = await product.find();
        for (let key of userData.cart.item) {
          for (let prod of productdata) {
            if (
              new String(prod._id).trim() ==
              new String(key.productId._id).trim()
            ) {
              prod.stock = prod.stock - key.quantity;
              await prod.save();
            }
          }
        }
        const categories = await category.find({ deleted: false });
        const subcategories = await subcategory.find({ deleted: false });

        res.render("ordersuccess", {
          user: req.session.username,
          loggedIn: req.session.userLogged,
          categories: categories,
          subcategories: subcategories,
          orders: newOrder,
        });
      } else {
        var razorpay = new Razorpay({
          key_id: "rzp_test_6ECQ3wFYlifQi2",
          key_secret: "akkbAG21AjGFcIfvmYditBnf",
        });
        let razorpayorder = await razorpay.orders.create({
          amount: req.body.cost * 100,
          currency: "INR",
          receipt: newOrder._id.toString(),
        });

        console.log("order Order created", razorpayorder);
        paymentDetails = razorpayorder;
        const productData = await product.find();
        for (let key of userData.cart.item) {
          for (let prod of productData) {
            if (
              new String(prod._id).trim() ==
              new String(key.productId._id).trim()
            ) {
              prod.stock = prod.stock - key.quantity;
              await prod.save();
            }
          }
        }
      }
    } else {
      var razorpay = new Razorpay({
        key_id: "rzp_test_6ECQ3wFYlifQi2",
        key_secret: "akkbAG21AjGFcIfvmYditBnf",
      });
      console.log(razorpay);
      let razorpayorder = await razorpay.orders.create({
        amount: req.body.cost * 100,
        currency: "INR",
        receipt: newOrder._id.toString(),
      });
      console.log("nadakko");

      console.log("order Order created", razorpayorder);
      paymentDetails = razorpayorder;
      console.log(newOrder + "asfasfasdfdsf");

      const productData = await product.find();
      for (let key of userData.cart.item) {
        for (let prod of productData) {
          if (
            new String(prod._id).trim() == new String(key.productId._id).trim()
          ) {
            prod.stock = prod.stock - key.quantity;
            await prod.save();
          }
        }
      }
      res.render("confirmpayment", {
        userId: req.session.user_id,
        order_id: razorpayorder.id,
        total: req.body.amount,
        session: req.session,
        key_id: process.env.key_id,
        user: userData,
        orders: newOrder,
        orderId: newOrder._id.toString(),
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadordersuccess = async (req, res) => {
  try {
    newOrder.paymentDetails.reciept = paymentDetails.receipt;
    newOrder.paymentDetails.status = paymentDetails.status;
    newOrder.paymentDetails.createdAt = paymentDetails.created_at;
    console.log("confirmation");
    let minuswalAmt = await User.updateOne(
      { _id: req.session.user_id },
      { $set: { wallet: 0 } }
    );
    await newOrder.save();
    await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } });
    const data = req.session.totalWallet;
    res.render("ordersuccess", { user: req.session.user, orders: newOrder });
  } catch (error) {
    console.log(error.message);
  }
};
const vieworders = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const users = req.session.user_id;
    const orderdetails = await order.findById({ _id: id });
    console.log(orderdetails);
    // const addres = await address.findById({_id:users})
    // console.log(addres);
    await orderdetails.populate("products.item.productId");
    const categories = await category.find({ deleted: false });
    const subcategories = await subcategory.find({ deleted: false });

    res.render("vieworders", {
      user: req.session.username,
      loggedIn: req.session.userLogged,
      orders: orderdetails,
      categories: categories,
      subcategories: subcategories,
    });
  } catch (error) {}
};

const cancelorders = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const users = req.session.user_id;
    const orderdetails = await order.findById({ _id: id });
    let state = "cancelled";
    await order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "cancelled" } }
    );
    if (state == "cancelled") {
      const productdata = await product.find();
      const orderdata = await order.findById({ _id: id });
      for (let key of orderdata.products.item) {
        for (let prod of productdata) {
          console.log(key.productId);
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.stock = prod.stock + key.quantity;
            await prod.save();
          }
        }
      }
    }
    if (state == "cancelled" && orderdetails.payment.method != "COD") {
      userdetails = await User.findOne({ _id: orderdetails.userId });
      const walletData = userdetails.wallet;
      userData = await User.updateOne(
        { _id: orderdetails.userId },
        { $set: { wallet: walletData + orderdetails.payment.amount } }
      );
    }

    res.redirect("/listorders");
  } catch (error) {
    console.log(error.message);
  }
};
const returnorders = async (req, res) => {
  try {
    const id = req.query.id;
    const users = req.session.user_id;
    const orderdetails = await order.findById({ _id: id });
    const addres = await address.findById({ _id: users });
    const cancel = await order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "returned" } }
    );
    await orderdetails.populate("products.item.productId");
    let state = "returned";
    if (state == "returned") {
      const productdata = await product.find();
      const orderdata = await order.findById({ _id: id });
      for (let key of orderdata.products.item) {
        for (let prod of productdata) {
          console.log(key.productId);
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.stock = prod.stock + key.quantity;
            await prod.save();
          }
        }
      }
    }
    if (state == "returned" && orderdetails.payment.method != "COD") {
      userdetails = await User.findOne({ _id: orderdetails.userId });
      const walletData = userdetails.wallet;
      userData = await User.updateOne(
        { _id: orderdetails.userId },
        { $set: { wallet: walletData + orderdetails.payment.amount } }
      );
    }
    res.redirect("/profileload");
  } catch (error) {
    console.log(error.message);
  }
};
const ordersload = async (req, res) => {
  try {
    const allorders = await order.find({}).populate("userId");
    const userData = await User.findById({ _id: req.session.admin_id });

    res.render("orders", {
      admin: userData,
      orders: allorders,
      orderdetail: allorders,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const vieworderdetails = async (req, res) => {
  try {
    const id = req.query.id;
    const orders = await order.findById({ _id: id });
    const details = await orders.populate("products.item.productId");
    res.render("vieworderdetails", { orders: details });
  } catch (error) {
    console.log(error.message);
  }
};

const updatestatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;
    const orderdetails = await order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: status } }
    );
    if (status == "cancelled" && orderdetails.payment.method !== "COD") {
      userDetails = await User.findOne({ _id: orderdetails.userId });
      const walletData = userDetails.wallet;
      userData = await User.updateOne(
        { _id: orderdetails.userId },
        { $set: { wallet: walletData + orderdetails.payment.amount } }
      );
    }
    if (status == "cancelled") {
      const productData = await product.find();
      const orderData = await order.findById({ _id: orderId });
      for (let key of orderData.products.item) {
        for (let prod of productData) {
          console.log(key.productId);
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.stock = prod.stock + key.quantity;
            await prod.save();
          }
        }
      }
    }

    res.redirect("/admin/ordersload");
  } catch (error) {}
};
const sortorder = async (req, res) => {
  let { start, end } = req.body;
  console.log(start, end);
  const allOrders = await order
    .find({
      createdAt: { $gte: start, $lte: end }, status : "Delivered"
    })
    .populate("userId");
  res.send({ orderDetail: allOrders });
};

const listorder = async (req, res) => {
  try {
    let { start, end } = req.body;
  
    const categories = await category.find({ deleted: false });
    const subcategories = await subcategory.find({ deleted: false });

    const allOrders = await order.find({ userId: req.session.user_id }).sort({createdAt :-1});
    const productArray = []
      for(let i=0 ; i<allOrders.length ; i++) {
        const userOrder = allOrders[i].products.item[0].productId
        const orderProduct = await product.findById({_id : userOrder})
        productArray.push(orderProduct)
      }
      console.log(productArray);
      
     

    res.render("listorders", {
      orderDetail: allOrders,
      loggedIn: req.session.userLogged,
      categories: categories,
      subcategories : subcategories,
      product :productArray
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  placeorder,
  vieworders,
  cancelorders,
  returnorders,
  loadordersuccess,
  ordersload,
  updatestatus,
  sortorder,
  vieworderdetails,
  listorder,
};
