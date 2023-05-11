const User = require('../models/usermodel');
const mongoose = require("mongoose");
 module.exports=async (req, res, next) => {
    try {
      if (req.session.user_id) {
        const user = await User.findById( req.session.user_id); 
        if(!user.blocked){
            next()
        } else {
            console.log(user.name+ "is logging out ....")
            req.session.user_id= null;
            req.session.userLogged = null
            res.render("login",{message:"you have been blocked by administrator",access:""})
        }
    }else{
        next();

    }
  
      
     
  
     
    } catch (error) {
      console.log(error.message);
      return res.redirect('/login?message=something went wrong');
    }
  };