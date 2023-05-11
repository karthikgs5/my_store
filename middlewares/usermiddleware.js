const User = require('../models/usermodel');
const mongoose = require("mongoose");
const isLogin = async (req,res,next)=>{

    try {
        
        if(req.session.userLogged){
            //the user has logged in
           next()
        }else{
            res.redirect('/login');
        }
    
    } catch (error) {
        console.log(error.message);
        
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(req.session.userLogged){

            res.redirect("/")
            
        }else{
            
            console.log("hi="+req.session.user_id);
            req.session.loggedIn=false
        } 
        next()
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const checkBlocked = async (req, res, next) => {
    try {
      const id = req.session.user_id;
      const user = await User.findById(id);
      if (user.blocked) {
        console.log(user.name + " is logging out ....");
        req.session.user_id = null;
        req.session.userLogged = null;
        return res.render("login", {message: "You have been blocked by the administrator."});
      } else {
        next();
      }
    } catch (error) {
      console.log(error.message);
      return res.redirect('/login?message=something went wrong');
    }
  };
  


  


module.exports = {
    isLogin,
    isLogout,
    checkBlocked
    
    
}