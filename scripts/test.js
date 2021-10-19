const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

global.types = [
    {en: "MUN", ar: "محاكاة الأمم المتحدة"},
    {en: "Course", ar: "دورة"},
    {en: "Webinar", ar: "ويبينار"}
];

// Load models
const Eduvent = require("../models/Eduvent");
const Initiative = require("../models/Initiative");
const Team = require("../models/Team");
const User = require("../models/User");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

async function hehe() {
    Object.keys(Eduvent.schema.paths).forEach(function(field) {
        if (field !== "__v" && field !== "_id") {
            console.log(field);
        }
    });

    process.exit();
}

hehe();