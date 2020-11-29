const mongoose = require('mongoose');

const purchaseOrderReport = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    productId: String,
    productName: String,
    manufacturer: String,
    reOrderQty: Number,
    balanceQty: Number,
    vendor: String
});

module.exports = purchaseOrderReportSchema = mongoose.model('purchaseOrderReport', purchaseOrderReport);