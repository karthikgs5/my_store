const User = require("../models/usermodel");
const mongoose = require("mongoose");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");
const coupon = require("../models/couponmodel")


  const couponload = async(req,res)=>{
    try{
        const search = req.query.search || '';
        const filter = { deleted: false };
        const coupons = await coupon.find({
          $and: [
            filter,
            {
              $or: [
                { name: { $regex: `.*${search}.*`, $options: 'i' } }
              ]
            }
          ]
        });

      res.render("couponload",{coupons:coupons})
    }
    catch(error){
      console.log(error.message);
    }
  }

  const addcoupon = async (req, res) => {
    try {
      const { name, discount, minimum,maximum,expiry } = req.body;
      
  
      let coupons = await coupon.findOne({ name });
  
      if (coupons) {
        return res.status(400).json({ errors: [{ msg: 'Coupon already exists' }] });
      }
    //   const inputdate = new Date(expiry)
    //   const formattedDate = `${inputdate.getDate()}-${inputdate.getMonth() + 1}-${inputdate.getFullYear()}`;

  
     const newcoupon = new coupon({
        name:name,
        discount:discount,
        minimumvalue:minimum,
        maximumvalue:maximum,
        expirydate:expiry
      });
  
      await newcoupon.save();
  
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  const editcouponload = async (req, res) => {
    try {
      const coupons = await coupon.findById(req.query.couponid);
      if (!coupons) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
      res.render('editcoupon', { coupons });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  const editcoupon = async (req, res) => {
    try {
      const { name, discount, minimum, maximum, expiry } = req.body;
  
      let coupons = await coupon.findById(req.query.couponid);
  
      if (!coupons) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
  
      coupons.name = name;
      coupons.discount = discount;
      coupons.minimumvalue = minimum;
      coupons.maximumvalue = maximum;
      coupons.expirydate = expiry;
  
      await coupons.save();
  
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  const deletecoupon = async (req, res) => {
    try {
        const id = req.query.couponid;
      const coupons = await coupon.findOne({_id: id,deleted:false});
  
      if (!coupons) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
      coupons.deleted= true;
      await coupons.save();
  
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  const availablecoupon =async (req,res)=>{
    try {
      const id=req.query.id;
      const allCoupon =await coupon.findOne({_id:id});
      if(allCoupon.isAvailable){
        await coupon.updateOne({_id:id},{$set:{isAvailable:0}})
      }else{
        await coupon.updateOne({_id:id},{$set:{isAvailable:1}})
  
      }
      res.redirect("/admin/couponload");
    } catch (error) {
      console.log(error.message);
    }
  };
  module.exports={
    couponload,
    addcoupon,
    editcouponload,
    editcoupon,
    deletecoupon,
    availablecoupon
  }