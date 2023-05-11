const mongoose = require("mongoose");
const product = require("../models/productmodel")
const userSchema = mongoose.Schema({

   name:{
       type:String,
       required:true
   },
   email:{
       type:String,
       required:true
   },
   phone:{
        type:Number,
        required:true
   },
   
   password:{
       type:String,
       required:true
   },
   bio :{
    type:String,
    default : "No Bio Added"
   },
           

    wishlist:
    [{ type: mongoose.Schema.Types.ObjectId,
       ref: 'product' }],

    cart: {
        item: [{
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price:{
                type:Number
            },

        }],
        totalprice: {
            type: Number,
            default: 0
        }
    },

   is_admin:{
       type:Number,
       required:true
   },
   blocked: {
    type: Boolean,
    default: false,
  },
    wallet: {
        type: Number,
        default:0
    },

   is_verified:{
       type:Number,
       default:0
   }
});

userSchema.methods.updatecart = async function (id,Quantity){
    const cart = this.cart
    const products = await product.findById(id)
    const index = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(products._id).trim()
    })
    console.log(id);
    console.log(Quantity)
    console.log(index)
    console.log(cart.item[index].quantity);
    if(Quantity >cart.item[index].quantity ){
        cart.item[index].quantity +=1
        console.log(cart.item[index].quantity);
        cart.totalprice += products.price
        console.log(cart.totalprice);
        console.log(products.price);
    }else if (Quantity < cart.item[index].quantity) {
        cart.item[index].quantity -= 1
        cart.totalprice -= products.price
    }else{

    }
    console.log(cart.totalprice);
     this.save()
     return cart.totalprice
}

userSchema.methods.removefromcart =async function (productId){
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    console.log(isExisting);
    if(isExisting >= 0){
        const prod = await product.findById(productId)
        console.log(prod);
        prod.stock += cart.item[isExisting].quantity;
        cart.totalprice -= prod.price * cart.item[isExisting].quantity

        cart.item.splice(isExisting,1)
       // console.log("User in schema:",this);
       await prod.save()
        return this.save()
    }
}


module.exports = mongoose.model('User',userSchema) 