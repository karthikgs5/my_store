const User = require("../models/usermodel");
const mongoose = require("mongoose");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");

const loadsubcategories = async (req, res) => {
    try {
      const search = req.query.search || '';
      const filter = { deleted: false };
      const subcategories = await subcategory.find({
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: `.*${search}.*`, $options: 'i' } },
              { description: { $regex: `.*${search}.*`, $options: 'i' } }
            ]
          }
        ]
      }).populate("category");
      const categories = await category.find({deleted:false});


      res.render("subcategory", { subcategories: subcategories,categories: categories });
    } catch (error) {
      console.log(error.message);
      res.redirect("/404error")
    }
  };
  const createsubcategory = async (req, res) => {
    try {
      const newsubcategory = new subcategory({
        name: req.body.name.toLowerCase(),
        description: req.body.description,
        category: req.body.category
      });
      await newsubcategory.save();
      console.log(newsubcategory)
      res.redirect('/admin/subcategories');
    } catch (err) {
      if (err.code === 11000) {
        res.redirect('/admin/subcategories');
      } else {
        // If some other error occurred
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
  const editsubcategoryload = async (req,res)=>{
    try {
        
        const id = req.query.id;
        const subcategories = await subcategory.findById({_id:id});
        console.log(subcategories);
        
        if(subcategories){
            
            res.render('editsubcategory',{subcategories:subcategories});
            console.log(subcategories);
        }else{
            res.redirect('/admin/categories')
        }
        
    } catch (error) {
        console.log(error.message);
    }
    
}
const editsubcategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const subcategories = await subcategory.findById({_id:id});
        console.log(subcategories);
        
            subcategories.name = req.body.name;
            subcategories.description = req.body.description;
            await subcategories.save();
            res.redirect('/admin/subcategories');
        
         } catch (error) {
        console.log(error.message);
    }
}
const deletesubcategory = async(req, res) => {
    const id = req.query.id;
  
    try {
      const subcategories = await subcategory.findOne({_id: id,deleted:false});
      console.log(subcategories);
      if (!subcategories) {
        return res.status(404).send("Subcategory not found");
      }
      subcategories.deleted= true;
        await subcategories.save();

      res.redirect('/admin/subcategories');
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports={
    loadsubcategories,
    createsubcategory,
    editsubcategoryload,
    editsubcategory,
    deletesubcategory

  }