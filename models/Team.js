const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,
        unique: true,
        maxlength: [50, "Name can not be more than 50 characters"]
    },
    members: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    totalTime: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Team", TeamSchema);