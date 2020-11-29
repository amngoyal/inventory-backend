const mongoose = require('mongoose');

const stock = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    manufacturer: String,
    orderedQty: Number,
    qtySold: Number,
    balance: Number
});

module.exports = stockSchema = mongoose.model('stocks', stock);