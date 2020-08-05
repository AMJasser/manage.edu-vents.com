const express = require("express");
const dotenv = require("dotenv");

// Route files
const eduvents = require("./routes/eduvents");

// Load ENV vars
dotenv.config({ path: "./config/config.env" });

const app = express();

// Mount routers
app.use("/edu-vents", eduvents);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`));