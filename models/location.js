const mongoose = require("mongoose");

var locationSchema = new mongoose.Schema({
    en: String,
    ar: String
});

module.exports = mongoose.model("Location", locationSchema);