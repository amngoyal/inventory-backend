const mongoose = require('mongoose');

const products = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    manufacturer: String,
    category: String,
    reOrderQty: Number
});

module.exports = productsSchema = mongoose.model('products', products);