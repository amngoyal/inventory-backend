const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./db/connection');
var ObjectID = require('mongodb').ObjectID;
const users = require('./db/usersSchema');
const products = require('./db/productsSchema');
const stock = require('./db/stockSchema');
const purchaseOrderReport = require('./db/purchaseOrderReportSchema');
const suppliers = require('./db/suppliersSchema');

const app = express();

app.use(cors());
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/add-product', async (request, response) => {
    const { productId, productName, manufacturer,
        category, reOrderQty, supplier, moq, leadTime, orderedQty, qtySold } = request.body;
    try {

        let productsRes = await products({
            productId, productName, manufacturer, category, reOrderQty
        }).save();

        console.log(productsRes)

        let supplierRes = await suppliers({
            productId, productName, manufacturer, supplier, moq, leadTime
        }).save();

        console.log(supplierRes)


        const balance = parseInt(orderedQty) - parseInt(qtySold)
        let stockRes = await stock({
            productId, productName, manufacturer, orderedQty, qtySold, balance
        }).save();

        console.log(stockRes);

        response.status(201).send("Added Successfully");
    }
    catch (e) {
        response.status(500).send("Intersnal server error");
    }
})

// ------------------------- Products -----------------------------
app.get('/get-products', (request, response) => {

    console.log("get-products")

    products.find().then(result => {
        return response.status(200).send(result);
    })
        .catch(err => {
            console.log(err)
        })

})

app.post('/update-product', async (request, response) => {
    const { objectId, updatedData } = request.body;
    console.log(objectId, updatedData);

    products.updateOne({ _id: ObjectID(objectId) }, { $set: updatedData }, (err, result) => {
        if (err)
            return response.status(500).send(err);

        console.log("product updated successfully")
        return response.status(201).send("product updated successfully")
    })

})

app.post('/delete-product', (req, res) => {
    const { objectId } = req.body;
    console.log("deletion", objectId)

    products.deleteOne({ _id: ObjectID(objectId) })
        .then(result => {
            res.status(200).send("product delete successfully")
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

// ----------------------------- Suppliers -----------------------------
app.get('/get-suppliers', (request, response) => {

    console.log("get-suppliers")

    suppliers.find()
        .then(result => {
            return response.status(200).send(result);
        })
        .catch(err => {
            console.log(err)
        })

})

app.post('/update-supplier', async (request, response) => {
    const { objectId, updatedData } = request.body;
    console.log(objectId, updatedData);

    suppliers.updateOne({ _id: ObjectID(objectId) }, { $set: updatedData }, (err, result) => {
        if (err)
            return response.status(500).send(err);

        console.log("supplier updated successfully")
        return response.status(201).send("supplier updated successfully")
    })

})

app.post('/delete-supplier', (req, res) => {
    const { objectId } = req.body;
    console.log("deletion", objectId)

    suppliers.deleteOne({ _id: ObjectID(objectId) })
        .then(result => {
            res.status(200).send("supplier delete successfully")
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

// ------------------------- stock --------------------------
app.get('/get-stock', (request, response) => {

    console.log("get-stock")

    stock.find()
        .then(result => {
            return response.status(200).send(result);
        })
        .catch(err => {
            return response.status(500).send(err)
        })

})

app.post('/update-stock', async (request, response) => {
    const { objectId, updatedData } = request.body;
    console.log(objectId, updatedData);

    stock.updateOne({ _id: ObjectID(objectId) }, { $set: updatedData }, (err, result) => {
        if (err)
            return response.status(500).send(err);

        console.log("stock updated successfully")
        return response.status(201).send("stock updated successfully")
    })

})

app.post('/login', (req, res, next) => {
    console.log(req.body.userId + " " + req.body.password);
    let { userId, password } = req.body;

    users.find({ userId }).then(userData => {

        let user = userData[0];

        console.log(user);

        if (user == null) {
            return res.status(404).send('User not found')
        }

        try {
            return password === user.password ?
                res.status(200).send({ userId: user.userId, name: user.name }) :
                res.status(400).send("Invalid user credentials");
        }
        catch (e) {
            return res.status(500).send("Something went wrong");
        }
    })
        .catch(e => {
            console.log(e);
            return res.status(500).send("unable to connect with db");
        });

})

app.get('/', (req, res, next) => {
    res.send("Server is running");
})

app.listen(process.env.PORT || 5000, () => {
    console.log("server is running at port 5000");
});