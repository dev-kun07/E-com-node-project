const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(process.env.connection_string);
    console.log("MongoDB Connected");
};

module.exports = connectDB;
