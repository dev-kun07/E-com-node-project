require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/mongodb");

const startServer = async () => {
    try {
        await connectDB();

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });
    } catch (error) {
        console.log("Unable to connect to MongoDB:", error.message);
    }
};

startServer();


