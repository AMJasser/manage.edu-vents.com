const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add a username"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    role: {
        type: String,
        enum: ["researcher", "writer", "admin"],
        required: [true, "Please add a role"]
    },
    score: {
        type: Number,
        default: 0
    },
    time: {
        type: Number,
        default: 0
    },
    team: {
        type: mongoose.Types.ObjectId,
        ref: "Team",
    }
});

UserSchema.statics.getTotalScoreTime = async function(teamId) {
    const obj = await this.aggregate([
        {
            $match: { team: teamId }
        },
        {
            $group: {
                _id: "$team",
                totalScore: { $sum: "$score" },
                totalTime: { $sum: "$time"}
            }
        }
    ]);
    try {
        await this.model("Team").findByIdAndUpdate(teamId, {
            totalScore: obj[0].totalScore,
            totalTime: obj[0].totalTime
        });
    } catch(err) {
        console.error(err);
    }
}

// Encrypt password using bcrypt
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Get total Score & Time
UserSchema.post("save", function() {
    if (this.team) {
        this.constructor.getTotalScoreTime(this.team);
    }
});
UserSchema.pre("remove", function() {
    if (this.team) {
        this.constructor.getTotalScoreTime(this.team);
    }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", UserSchema);