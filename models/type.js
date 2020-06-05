const mongoose = require("mongoose");

var typeSchema = new mongoose.Schema({
    en: String,
    ar: String
});

module.exports = mongoose.model("Type", typeSchema);