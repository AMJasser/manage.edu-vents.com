const mongoose = require("mongoose");
const dotenv = require("dotenv");
const types = require("../utils/types");

// Load env vars
dotenv.config({ path: "./config/config.env" });

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

const eduvents = [
    {
        _id: "5f3c190ff707a06329816528",
        name: {
            en: "Common App Webinar",
            ar: "ويبينار التقديم الجامعي"
        },
        type: {
            en: "Webinar",
            ar: "ويبينار"
        },
        img: "notif_logo.jpg",
        description: {
            en: "Webinar on applying to colleges through common app",
            ar: "ندوة عبر الإنترنت حول التقديم للكليات من خلال التطبيق المشترك"
        },
        url: "https://edu-vents.com",
        user: "5f3c187dc04fba1038c22c73",
        initiative: "5f3c1886f749cd26403a5ca2",
        clickCount: 12
    },
    {
        name: {
            en: "EDU-vents Festival",
            ar: "مهرجان إديوفنتس"
        },
        type: {
            en: "MUN",
            ar: "محاكاة الأمم المتحدة"
        },
        img: "notif_logo.jpg",
        description: {
            en: "Festival run by EDU-vents",
            ar: "المهرجان يديره EDU-vents"
        },
        url: "https://edu-vents.com",
        user: "5f3c187dc04fba1038c22c73",
        clickCount: 12
    },
    {
        name: {
            en: "MUN",
            ar: "محاكاة الأمم المتحدة"
        },
        type: {
            en: "MUN",
            ar: "محاكاة الأمم المتحدة"
        },
        img: "notif_logo.jpg",
        description: {
            en: "MUN run by EDU-vents",
            ar: "تدير MUN بواسطة EDU-vents"
        },
        url: "https://edu-vents.com",
        user: "5f3c187dc04fba1038c22c73",
        initiative: "5f3c1886f749cd26403a5ca2",
        clickCount: 12
    },
    {
        name: {
            en: "hehe",
            ar: "هيهي"
        },
        type: {
            en: "MUN",
            ar: "محاكاة الأمم المتحدة"
        },
        img: "notif_logo.jpg",
        description: {
            en: "MUN run by EDU-vents",
            ar: "تدير MUN بواسطة EDU-vents"
        },
        url: "https://edu-vents.com",
        user: "5f3c187dc04fba1038c22c73",
        initiative: "5f3c1886f749cd26403a5ca2",
        clickCount: 12
    }
];

const initiatives = [
    {
        _id: "5f3c1886f749cd26403a5ca2",
        name: {
            en: "EDU-vents",
            ar: "إديوفنتس"
        },
        description: {
            en: "EDU-vents is a website",
            ar: "إديوفنتس هو موقع ويب"
        },
        url: "https://edu-vents.com",
        img: "notif_logo.jpg"
    }
];

const teams = [
    {
        _id: "5f3c5427c75008dbf7d11d7d",
        name: "Team #1",
        members: ["5f3c187dc04fba1038c22c73", "5f3c2290ba100ffed5785b38"]
    }
];

const users = [
    {
        username: "admin",
        password: "admin1122",
        role: "admin",
        score: 200,
        time: 300
    },
    {
        _id: "5f3c2290ba100ffed5785b38",
        username: "researcher",
        password: "researcher",
        role: "researcher",
        score: 12,
        time: 50,
        team: "5f3c5427c75008dbf7d11d7d",
    },
    {
        _id: "5f3c187dc04fba1038c22c73",
        username: "writer",
        password: "writer",
        role: "writer",
        score: 14,
        time: 40,
        team: "5f3c5427c75008dbf7d11d7d"
    }
];

// Import
const importData = async () => {
    try {
        await Eduvent.create(eduvents);
        await Initiative.create(initiatives);
        await Team.create(teams);
        await User.create(users);
        console.log("Data Imported...");
        process.exit();
    } catch(err) {
        console.error(err);
    }
}

// Delete
const deleteData = async () => {
    try {
        await Eduvent.deleteMany();
        await Initiative.deleteMany();
        await Team.deleteMany();
        await User.deleteMany();
        console.log("Data Destroyed...");
        process.exit();
    } catch(err) {
        console.error(err);
    }
}

//Login
const seedLogin = async () => {
    try {
        await User.deleteMany();
        await User.create({
            username: "admin",
            password: "Aboody.204",
            role: "admin"
        });
        await User.create({
            username: "testres",
            password: "Aboody.204",
            role: "researcher"
        });
        await User.create({
            username: "testwri",
            password: "Aboody.204",
            role: "writer"
        });
        console.log("Deleted all users and created test users");
        process.exit();
    } catch(err) {
        console.err(err);
    }
};

if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
} else if (process.argv[2] === "-login") {
    seedLogin();
}