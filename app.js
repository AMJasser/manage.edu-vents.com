const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const path = require("path");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load ENV vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connectDB();

// Route files
const index = require("./routes/index");
const auth = require("./routes/auth");
const eduvents = require("./routes/eduvents");
const teams = require("./routes/teams");

const app = express();

// Set view engine
app.set("view engine", "ejs");

// Body parser
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Method Override
app.use(methodOverride("_method"));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use(index);
app.use(auth);
app.use("/edu-vents", eduvents);
app.use("/teams", teams);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.bold.cyan));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});