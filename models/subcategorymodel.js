const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
 
  },
  description: {
    type: String,
    required:true
  },
  deleted:{
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
  }
});

module.exports = mongoose.model('subcategory',subcategorySchema) 