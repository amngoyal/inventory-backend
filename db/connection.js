const mongoose = require('mongoose');

const uri = "mongodb+srv://admin:inventoryApp@cluster0.liq0r.mongodb.net/inventory?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("db connected...");
    }
    catch (e) {
        console.log("something went wrong in connecting database");
        console.log(e);
    }
}

module.exports = connectDB;