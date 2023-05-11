const User = require("../models/usermodel");
const mongoose = require("mongoose");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");

const  createcategory = async (req, res) => {
    try {
      const newcategory = new category({
        name: req.body.name.toLowerCase(),
        description: req.body.description
      });
      await newcategory.save();
      console.log(newcategory)
      res.redirect('/admin/categories');
    } catch (err) {
      if (err.code === 11000) {
        res.redirect('/admin/categories');
      } else {
        // If some other error occurred
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
  const loadcategories = async (req, res) => {
    try {
      const search = req.query.search || '';
      const filter = { deleted: false };
      const categories = await category.find({
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: `.*${search}.*`, $options: 'i' } },
              { description: { $regex: `.*${search}.*`, $options: 'i' } }
            ]
          }
        ]
      });
      res.render('category', { categories: categories });
    } catch (error) {
      console.log(error.message);
    }
  };
  

  const editcategoryload = async (req,res)=>{
    try {
        
        const id = req.query.id;
        const categories = await category.findById({_id:id});
        console.log(categories);
        
        if(categories){
            
            res.render('editcategory',{categories:categories});
            console.log(categories);
        }else{
            res.redirect('/admin/categories')
        }
        
    } catch (error) {
        console.log(error.message);
    }
    console.log('edit ethiaa')
}
const editcategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const categories = await category.findById({_id:id});
        console.log(categories);
        
            categories.name = req.body.name;
            categories.description = req.body.description;
            await categories.save();
            res.redirect('/admin/categories');
        
         } catch (error) {
        console.log(error.message);
    }
}

const deletecategory = async(req, res) => {
    const id = req.query.id;
  
    try {
      const categories = await category.findOne({_id: id,deleted:false});
      console.log(categories);
      if (!categories) {
        return res.status(404).send("Category not found");
      }
        categories.deleted= true;
        await categories.save();

      res.redirect('/admin/categories');
    } catch (error) {
      console.log(error.message);
    }
  }
 module.exports= {
    createcategory,
    loadcategories,
    editcategoryload,
    editcategory,
    deletecategory

 }