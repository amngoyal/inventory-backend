const mongoose = require('mongoose');

const porSchema = new mongoose.Schema({
    productId: String,
    productName: String,
    manufacturer: String,
    reOrderQty: Number,
    balance: Number,
    allSuppliers: Array
});

module.exports = por = mongoose.model('por', porSchema, "por");