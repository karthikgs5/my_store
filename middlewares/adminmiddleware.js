const User = require('../models/usermodel');
const isLogin =async (req,res,next)=>{
    try {
        if(req.session.adminlogged==true){
           
            next()
            
        }else{
            console.log("hello") 
            res.redirect('/admin');
            
        }
        
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(req.session.adminlogged){
            res.redirect('/admin/dashboard');
        }else{
            next();
        }
        
        
    } catch (error) {
        console.log(error.message);
        
    }
}
 




module.exports = {
    isLogin,
    isLogout
    
    
}