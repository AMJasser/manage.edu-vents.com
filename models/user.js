const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: Boolean,
    score: Number,
    researcher: {
        name: String,
        time: Number
    },
    writer: {
        name: String,
        time: Number,
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);