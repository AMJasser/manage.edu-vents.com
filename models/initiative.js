const mongoose = require("mongoose");

var initiativeSchema = new mongoose.Schema({
    name: String,
    description: String,
    nameAr: String,
    descriptionAr: String,
    url: String,
    imgPath: String,
});

module.exports = mongoose.model("Initiative", initiativeSchema);