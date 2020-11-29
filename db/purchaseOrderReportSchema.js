const mongoose = require('mongoose');

const purchaseOrderReportSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    surname: String,
    // productId: String,
    // productName: String,
    // manufacturer: String,
    // reOrderQty: Number,
    // balanceQty: Number,
    // vendor: String
});

module.exports = purchaseOrderReport = mongoose.model('por', purchaseOrderReportSchema);