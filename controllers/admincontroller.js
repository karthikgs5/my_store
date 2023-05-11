const User = require("../models/usermodel");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");
const product = require("../models/productmodel");
const coupon = require("../models/couponmodel");
const bcrypt = require("bcrypt");
const order = require("../models/ordermodel");
const { db } = require("../models/usermodel");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loginpageload = async (req, res) => {
  try {
    if (req.session.admin_id) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("login", { message: "" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifylogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log("hi");
    console.log(email);

    const userData = await User.findOne({ email: email });
    console.log(userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          console.log(userData);
          res.render("login", { message: "Email and password is incorrect." });
        } else {
          req.session.admin_id = userData._id;
          req.session.adminlogged = true;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email and password is incorrect." });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect." });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loaddashboard = async (req, res) => {
  try {
    const products = await product.find();
    let pds = [],
      qty = [];
    products.map((x) => {
      pds = [...pds, x.name];
      qty = [...qty, x.stock];
    });
    const arr = [];
    const orders = await order.find().populate("products.item.productId");
    for (let Orders of orders) {
      for (let product of Orders.products.item) {
        const index = arr.findIndex(
          (obj) => obj.product == product.productId.name
        );
        if (index !== -1) {
          arr[index].quantity += product.quantity;
        } else {
          arr.push({
            product: product.productId.name,
            quantity: product.quantity,
          });
        }
      }
    }
    const key1 = [];
    const key2 = [];
    arr.forEach((obj) => {
      key1.push(obj.product);
      key2.push(obj.quantity);
    });
    const sales = key2.reduce((value, number) => {
      return value + number;
    }, 0);
    let totalRevenue = 0;
    for (let Orders of orders) {
      totalRevenue += Orders.products.totalprice;
    }

    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("dashboard", {
      admin: userData,
      key1,
      key2,
      pds,
      qty,
      sales,
      totalRevenue,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userload = async (req, res) => {
  try {
    const userData = await User.find({});

    res.render("showusers", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};
const blockuser = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById({ _id: id });
    if (user) {
      user.blocked = !user.blocked;
      await user.save();
      console.log(user);
      res.redirect("/admin/showusers");
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin_id = null;
    console.log(req.session.admin_id);

    req.session.adminlogged = false;
    console.log(req.session.adminlogged);
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const salesReport = async (req, res) => {
  try {
    const sales = await order.find({ status: "Delivered" });
    console.log(sales);

    const productArray = [];
    for (let i = 0; i < sales.length; i++) {
      const userOrder = sales[i].products.item[0].productId;
      const orderProduct = await product.findById({ _id: userOrder });
      productArray.push(orderProduct);
    }

    res.render("salesreport", { sales: sales , product : productArray });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  securePassword,
  loginpageload,
  verifylogin,
  loaddashboard,
  userload,
  logout,
  blockuser,
  salesReport,
};
