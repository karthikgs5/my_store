const User = require("../models/usermodel");
const mongoose = require("mongoose");
const category = require("../models/categorymodel");
const subcategory = require("../models/subcategorymodel");
const product = require("../models/productmodel");
const fetch = require("node-fetch");

const accountId = '6686558e5c6bdab1df74ba5cc8151762';
const namespaceId = 'efe7b005339a44e9b9ce1a22a4a713c3';
const apiKey = '84fcba771dc54f3e648d067eae2c1308b3883';



const productload = async (req, res) => {
    try {
      const categorize = req.query.categoryid;
      const subcategorize = req.query.subcategoryid;
      const pricemin = parseInt(req.query.priceMin)|| 0;
      const pricemax = parseInt(req.query.priceMax)|| 2000;
      console.log(categorize);
      console.log(subcategorize);
      console.log(pricemin);
      console.log(pricemax);
      req.session.priceMin = pricemin;
      req.session.priceMax = pricemax;
  
      const page = parseInt(req.query.page) || 1; // Current page number
      const pageSize = parseInt(req.query.pageSize) || 6; // Number of items per page
      const skip = (page - 1) * pageSize; // Number of items to skip
      let query = { deleted: false,price:{$gte: pricemin, $lte: pricemax} };
      
       if (categorize) {
        query.category = categorize
      }
  
       if (subcategorize) {
        query.subcategory = subcategorize
        const subcategoryObj = await subcategory.findOne({ _id: subcategorize });
      if (subcategoryObj) {
        if (subcategoryObj.priceMin > pricemin) {
          query.price.$gte = subcategoryObj.priceMin;
        }
        if (subcategoryObj.priceMax < pricemax) {
          query.price.$lte = subcategoryObj.priceMax;
        }
      }

      }
      if (req.query.query) {
        query.name =  { $regex: req.query.query, $options: "i" };
      }
      const sortorder = req.query.sortorder || "asc";
      const count = await product.countDocuments(query); // Count the total number of matching documents
      const totalPages = Math.ceil(count / pageSize); // Calculate the total number of pages
  
      const products = await product.find(query).sort({price: sortorder === "asc" ? 1 : -1 }).skip(skip).limit(pageSize)
  
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
       
      res.render("productload", {
          req: req,
          loggedIn: req.session.userLogged,
          categories: categories,
          subcategories: subcategories,
          products: products,
          pricemin: pricemin,
          pricemax: pricemax,
          categorize:categorize,
          subcategorize:subcategorize,
          page: page,
          pageSize: pageSize,
          totalPages: totalPages,
          query: req.query.query, // Pass search query to EJS template
          sortorder:sortorder
        });
      
    } catch (error) {
      console.log(error.message);
    }
  };
  const productdetails = async (req, res) => {
    try {
      const productid = req.query.productid;
  
      const products = await product.findById(productid);
  
      const categories = await category.find({ deleted: false });
      const subcategories = await subcategory.find({ deleted: false });
  
      res.render("product-details", {
        loggedIn: req.session.userLogged,
        categories: categories,
        subcategories: subcategories,
        products: products,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  const addproduct = async(req,res)=>{
    try{
      const categories = await category.find({deleted:false})
      const subcategories = await subcategory.find({deleted:false})
      if(req.session.productadded){
       
        res.render("products",{message:"product added",categories:categories,subcategories:subcategories})
      }else{
        res.render("products",{message:"",categories:categories,subcategories:subcategories})
      }

 

    }
    catch(error){
      console.log(error.message)

    }

  }
  const addproductprocess = async (req, res) => {
    try {
        const { name, description, price,stock, mycategory, mysubcategory } = req.body;
        const lowercasename = name.toLowerCase()
        
        const categories = await category.find({deleted:false})
        const subcategories = await subcategory.find({deleted:false})
        
        
        const existingProduct = await product.findOne({ name: name });
        
        if (existingProduct) {
          req.session.productadded = false;
          res.render('products', { message: 'Product already exists',categories:categories,subcategories:subcategories });
          
        }
        
        
        const images = req.files
       
        // console.log(images[0].filename);
        const newproduct = new product({
            name: lowercasename,
            description,
            price,
            stock,
            images : images.map((x) => x.filename),
            category: mycategory,
            subcategory: mysubcategory
        });
        
          // console.log(newproduct)
          await newproduct.save();

          // console.log(newproduct.images[0])


  
        // console.log(newproduct.images);
        req.session.productadded = true;
        res.redirect('/admin/showproducts');
    } catch (err) {
        console.error(err);
    }
};


  const showproducts = async(req,res)=>{
    try{

      const search = req.query.search || '';
      const filter = { deleted: false };
      const products = await product.find({
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: `.*${search}.*`, $options: 'i' } },
              { description: { $regex: `.*${search}.*`, $options: 'i' } }
            ]
          }
        ]
      },
      {images: 1, name: 1, description: 1, price: 1, category: 1, subcategory: 1, stock:1 }
      ).populate("category subcategory")
      // console.log(products);
      const categories= await category.find()
      const subcategories= await subcategory.find()
      res.render("showproducts",{products:products,categories:categories,subcategories:subcategories})
      // console.log(products);
    }catch(error){
      console.log(error.message)
    }
  }

  const editproductload = async(req,res)=>{
    try{
    const id = req.query.id
    // console.log(id)
    const products = await product.findById(id).populate("category").populate("subcategory");
    // console.log(products)
    const subcategories = await subcategory.find({deleted:false})
    const categories = await category.find({deleted:false})
    if(products){

            
      res.render('editproduct',{products:products,categories:categories,subcategories:subcategories, images: products.images.map((image, index) => ({ path: image, index: index })),index:"",message:""});
      
  }else{
      res.redirect('/admin/editproduct')
  }

    }

  catch(error){
    console.log(error.message)
  }


  }
  const editproduct = async(req,res)=>{
    try {
        const id = req.query.id;
        const products = await product.findById({_id:id})

        // get existing images
        const existingImages = products.images;

        // get new image paths
        const newImagePaths = req.files.map(file => file.filename);

        // combine existing and new image paths
        const imagePaths = [...existingImages, ...newImagePaths];

        // update product fields
        products.name = req.body.name;
        products.description = req.body.description;
        products.price = req.body.price;
        products.stock = req.body.stock;
        products.images = imagePaths;
        products.category = req.body.mycategory;
        products.subcategory = req.body.mysubcategory;

        await products.save();

        // console.log(products.images);
        res.redirect('/admin/showproducts');
        
    } catch (error) {
        console.log(error.message);
    }
}


const deleteproduct = async(req, res) => {
  const id = req.query.id;

  try {
    const products = await product.findOne({_id:id,deleted:false});
    console.log(products);
    if (!products) {
      return res.status(404).send("product not found");
    }
    products.deleted= true;
    await products.save();

    res.redirect('/admin/showproducts');
  } catch (error) {
    console.log(error.message);
  }
}
const deleteimage = async (req, res) => {

  try {

    let { pId, img } = req.body
    console.log(pId, img);
    await product.updateOne({ _id: pId }, { $pull: { images: img } })
    const productData =await product.findOne({ _id: pId })
    console.log(productData);
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${img}`;
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'text/plain'
    };
    const body = productData.images.find(image => image === img);
    console.log(body);
    const options = {
      method: 'PUT',
      headers,
      body
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);

   
    console.log("amina")
    res.send({ newImage: productData.images });
 

  
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {

    productload,
    productdetails,
    addproduct,
    addproductprocess,
    showproducts,
    editproductload,
    editproduct,
    deleteproduct,
    deleteimage

}