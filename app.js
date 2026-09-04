const express = require("express");
const accountRoutes = require('./routes/users'); 
const productRoutes = require("./routes/product");

const app = express();
const cors=require('cors')

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "ecom-sim API is running"
    });
});

app.use("/account", accountRoutes);
app.use("/product", productRoutes);




module.exports = app;
