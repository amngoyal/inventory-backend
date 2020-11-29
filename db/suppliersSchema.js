const mongoose = require('mongoose');

const suppliers = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    manufacturer: String,
    supplier: String,
    moq: Number,
    leadTime: Number
});

module.exports = suppliersSchema = mongoose.model('suppliers', suppliers);