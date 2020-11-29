const mongoose = require('mongoose');

const products = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    manufacturer: String,
    category: String,
    reOrderQty: Number,
    supplier: String,
    moq: Number,
    leadTime: Number,
    orderedQty: Number,
    qtySold: Number
});

module.exports = productsSchema = mongoose.model('products', products);