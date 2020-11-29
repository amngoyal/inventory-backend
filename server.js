const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db/connection');
var ObjectID = require('mongodb').ObjectID;
const users = require('./db/usersSchema');
const products = require('./db/productsSchema');
const stock = require('./db/stockSchema');
const por = require('./db/porSchema.js');
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

        let productRes = await products(request.body).save();

        console.log(productRes)

        let supplierRes = await suppliers({
            productId, productName, manufacturer, supplier, moq, leadTime
        }).save();

        console.log(supplierRes)


        const balance = parseInt(orderedQty) - parseInt(qtySold)
        let stockRes = await stock({
            productId, productName, manufacturer, orderedQty, qtySold, balance
        }).save();

        console.log(stockRes);

        return response.status(201).send("Added Successfully");
    }
    catch (e) {

        if (productRes._id) {
            products.remove({ _id: ObjectID(productRes._id) })
        }
        if (supplierRes._id) {
            supplier.remove({ _id: ObjectID(supplierRes._id) })
        }
        if (productsRes._id) {
            stock.remove({ _id: ObjectID(stockRes._id) })
        }

        return response.status(500).send("Intersnal server error");
    }
})

// ------------------------- Products -----------------------------
app.get('/get-products', (request, response) => {

    console.log("get-products")

    products.find()
        .then(result => {
            return response.status(200).send(result);
        })
        .catch(err => {
            console.log(err)
        })

})

app.post('/update-product', async (request, response) => {
    const { objectId, updatedData } = request.body;
    console.log(objectId, updatedData);

    products.updateOne({ _id: ObjectID(objectId) }, { $set: updatedData }, async (err, result) => {
        if (err)
            return response.status(500).send(err);

        let { productName, manufacturer, reOrderQty } = updatedData
        let supplierRes = await suppliers.updateOne({ productId: updatedData.productId }, { $set: { productName, manufacturer } })
        let stockRes = await stock.updateOne({ productId: updatedData.productId }, { $set: { productName, manufacturer } })
        let porRes = await por.updateOne({ productId: updatedData.productId }, { $set: { productName, manufacturer, reOrderQty } })


        console.log("product updated successfully")
        return response.status(201).send("product updated successfully")
    }).catch(err => {
        console.log(err);
    })



})

app.post('/delete-product', (req, res) => {
    const { objectId, productId } = req.body;
    console.log("deletion", objectId)

    products.deleteOne({ _id: ObjectID(objectId) })
        .then(async result => {
            try {
                await stock.deleteOne({ productId })
                await por.deleteOne({ productId });
                res.status(201).send("done")
            } catch (e) {
                return res.status(500).send(e)
            }
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

app.post('/add-supplier', (request, response) => {

    console.log(request.body.newSupplier)
    const { productId, productName, manufacturer, supplier, leadTime, moq } = request.body.newSupplier;
    suppliers({
        productId, productName, manufacturer, supplier, leadTime, moq
    }).save()
        .then(res => {
            return response.status(201).send("New supplier created")
        })
        .catch(err => {
            return response.status(500).send("error in creating new supplier");
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

        products.find({ productId: updatedData.productId }).then(result => {
            console.log(result)
            const { productId, productName, manufacturer, reOrderQty } = result[0];
            const { balance } = updatedData
            if (updatedData.balance <= reOrderQty) {

                suppliers.find({ productId }).then(supp => {

                    if (supp[0]) {

                        let allSuppliers = []
                        supp.forEach(el => {
                            const { supplier, moq, leadTime } = el;
                            allSuppliers.push({
                                supplier, moq, leadTime
                            })
                        })

                        por.find({ productId }).then(el => {
                            if (el[0]) {
                                por.updateOne({ productId }, {
                                    $set: {
                                        productId, productName, manufacturer, reOrderQty, balance, allSuppliers
                                    }
                                }).then(res => {
                                    response.status(200).send("por existed and updated")
                                })
                            }
                            else {
                                por({
                                    productId, productName, manufacturer, reOrderQty, balance, allSuppliers
                                }).save()
                                    .then(() => {
                                        return response.status(201).send("purchase order created")
                                    })
                                    .catch(err => {
                                        return response.status(500).send("unable to create purchase order")
                                    })
                            }
                        }
                        )

                    }

                })

            }
            else {
                return response.status(201).send("stock updated successfully")
            }
        }).catch(err => {
            console.log(err)
        })

    })

})

app.get('/get-purchase-report', (request, response) => {

    console.log("get-por")

    por.find()
        .then(result => {
            return response.status(200).send(result);
        })
        .catch(err => {
            return response.status(500).send(err)
        })

})


app.post('/create-por', (request, response) => {

    console.log("create-por")
    const { productId, productName, manufacturer, reOrderQty, balance, allSuppliers } = request.body;

    por({
        productId, productName, manufacturer, reOrderQty, balance, allSuppliers
    }).save()
        .then(() => {
            return response.status(201).send("purchase order created")
        })
        .catch(err => {
            return response.status(500).send("unable to create purchase order")
        })
})

app.post('/delete-por', (request, response) => {
    console.log("delete por", request.body.productId)


    por.remove({ productId: request.body.productId })
        .then(res => {
            console.log(res)
            return response.status(201).send("por deleted")
        })
        .catch(err => {
            console.log(err)
            return response.status(500).send(err)
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