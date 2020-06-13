const mongoose      = require("mongoose");

var formSchema = new mongoose.Schema({
    name: String,
    endDate: Date,
    url: String,
    responses: [{
        QandA: [[String, String]],
        files: [[String, String]],
        fid: String,
    }],
    html: String,
    isOpen: Boolean
});

module.exports = mongoose.model("Form", formSchema);