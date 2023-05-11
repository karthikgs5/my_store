const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
        
    },
     subcategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory',
        required: true
        
     },

    price : {
        type: Number,
        required: true
        
    },
    
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        
    },
    images: {
        type: [String],
        

    },
    stock: {
        type: Number,
        required:true
    },
    deleted:{
        type: Boolean,
        default: false
      },
    isAvailable: {
        type: Number,
        default:1
    }
},{timestamps:true})

module.exports = mongoose.model('product',productSchema)