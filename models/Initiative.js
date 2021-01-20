const mongoose = require("mongoose");
const slugify = require("slugify");

const InitiativeSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, "Please add a name"],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
            unique: true
        },
        ar: {
            type: String,
            required: [true, "Please add an arabic name"],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
            unique: true
        }
    },
    description: {
        en: {
            type: String,
            required: [true, "Please add a description"],
        },
        ar: {
            type: String,
            required: [true, "Please add an arabic description"],
        }
    },
    slug: String,
    url: {
        type: String,
        required: [true, "Please add a url"],
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            "Please add a valid URL"
        ]
    },
    img: {
        type: String,
        default: "no-photo.jpg"
    }
});

// Reverse populate
InitiativeSchema.virtual("eduvents", {
    ref: "Eduvent",
    localField: "_id",
    foreignField: "initiative",
    justOne: false
});

// Create Initiative Slug from name
InitiativeSchema.pre("save", async function(next) {
    this.slug = slugify(this.name.en, { lower: true });
    next();
});

module.exports = mongoose.model("Initiative", InitiativeSchema);