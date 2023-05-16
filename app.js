const mongoose =require("mongoose")
require('dotenv').config()
mongoose.set("strictQuery",false)


// mongoose.connect(process.env.MONGO_CONN,()=>{
//   console.log('database connection established')
// })


mongoose.connect("mongodb+srv://karthikgs:xnGTbwDqduf7dNgL@cluster0.8adftd7.mongodb.net/mykart",()=> {
  console.log('Database Connected!!!');
});



const ejs = require("ejs")
const multer= require("multer")

const session = require('express-session')
const nocache = require('nocache');

const path =require("path")

const express= require("express")
const app =express()
app.set('view engine', 'ejs');
app.use(express.static("public"));

const bodyparser=require("body-parser")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(nocache())


app.use(session({
  secret:"hiuewyfuibyiuwef",
  resave:true,
  saveUninitialized:true,
  cookie:{
    maxAge:1000*60*60*24*7
  }
}))




console.log("hi")
app.get('/api/data', function(req, res) {
  db.getData(function(err, data) {
    if (err) {
      res.status(500).send('Error retrieving data');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
    }
  });
});


app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    next();
  });


const userroute= require("./routes/userroute")
app.use("/",userroute)

const adminroute= require("./routes/adminroute")
app.use("/admin",adminroute)

app.listen(3000,function(){
    console.log("server is running......")
})