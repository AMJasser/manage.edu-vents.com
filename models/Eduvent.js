const mongoose = require("mongoose");
const types = require("../utils/types");

const EduventSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, "Please add a name"],
            unique: true,
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"]
        },
        ar: {
            type: String,
            required: [true, "Please add an arabic name"],
            unique: true,
            trim: true,
            maxlength: [50, "Arabic name can not be more than 50 characters"]
        }
    },
    type: {
        en: {
            type: String,
            enum: types.map(type => type.en),
            required: [true, "Please add a type"],
        },
        ar: {
            type: String,
            enum: types.map(type => type.ar),
            required: [true, "Please add an arabic type"],
        }
    },
    img: {
        type: String,
        default: "no-photo.jpg"
    },
    description: {
        en: {
            type: String,
            required: [true, "Please add a description"],
            maxlength: [500, "Description can not be more than 500 characters"]
        },
        ar: {
            type: String,
            required: [true, "Please add an arabic description"],
            maxlength: [500, "Arabic description can not be more than 500 characters"]
        }
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        },
        formattedAddress: String,
    },
    url: {
        type: String,
        required: [true, "Please add a URL"],
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "Please add a valid URL"]
    },
    featuredUntil: Date,
    date: Date,
    endDate: Date,
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    initiative: {
        type: mongoose.Types.ObjectId,
        ref: "Initiative"
    },
    clickCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Eduvent", EduventSchema);