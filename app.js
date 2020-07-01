const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const schedule = require("node-schedule");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const User = require("./models/user");
const Eduvent = require("./models/eduvent");
const EduventAr = require("./models/eduventAr");
const Type = require("./models/type");
const Location = require("./models/location");
const Form = require("./models/form");
const Initiative = require("./models/initiative");
const json = require("body-parser/lib/types/json");

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(helmet());
app.use(cookieParser());

mongoose.connect("mongodb://localhost:27017/EDU-vents", { useNewUrlParser: true, useUnifiedTopology: true }).catch(error => { console.log(error) });
mongoose.set("useFindAndModify", false);

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now() + path.extname(file.originalname));
    }
});
const formStorage = multer.diskStorage({
    destination: "./uploads/"
});
const upload = multer({ storage: storage }).single("img");
const formUpload = multer({ storage: formStorage }).single("formHTML");

app.use(session({
    secret: "the author of this website is Abdullah AlJasser",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    };
    res.redirect("/login");
};

app.get("/login", function (req, res) {
    if (typeof req.query.msg !== "undefined") {
        res.render("login", { msg: req.query.msg }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } else {
        res.render("login", function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?msg=incorrect username or password"
}));

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/login");
});

app.get("/resetstuff", isLoggedIn, async function (req, res) {
    try {
        if (req.user.isAdmin === true) {
            var users = await User.find({});
            users.forEach(function (user) {
                user.volunteers.forEach(function (volunteer) {
                    volunteer.time = 0;
                });
            });
            users.save();
            res.send("success");
        } else {
            res.send("FUCK OFF");
        }
    } catch (err) {
        console.error(err);
        res.status(500).render("error");
    }
});

app.get("/", isLoggedIn, async function (req, res) {
    if (req.user.isAdmin === true) {
        try {
            var eduvents = {
                en: [],
                ar: []
            };
            var chartData = {
                names: [],
                scores: []
            };
            var formNames = [];

            eduvents.en = await Eduvent.find();
            eduvents.ar = await EduventAr.find();
            allUsers = await User.find();

            allUsers.forEach(function (user) {
                if (user.isAdmin === false) {
                    chartData.names.push(user.username);
                    if (user.score === null || user.score === undefined) {
                        user.score = 0;
                    };
                    chartData.scores.push(user.score);
                };
            });

            var users = await User.find();
            var types = await Type.find();
            var locations = await Location.find();
            var forms = await Form.find();
            var initiatives = await Initiative.find();

            if (typeof forms === "object") {
                forms.forEach(function (oneForm) {
                    formNames.push(oneForm.url.substring(0, oneForm.url.length - 4));
                });
                formNames = formNames.join(",");
            }

            if (typeof req.query.msg !== "undefined") {
                res.render("index", { locations: locations, types: types, forms: forms, formNames: formNames, initiatives: initiatives, users: users, username: req.user.username, isAdmin: true, eduvents: eduvents, chartData: chartData, msg: req.query.msg }, function (err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", { error: err });
                    } else {
                        res.send(html);
                    }
                });
            } else {
                res.render("index", { locations: locations, types: types, forms: forms, formNames: formNames, initiatives: initiatives, users: users, username: req.user.username, isAdmin: true, eduvents: eduvents, chartData: chartData }, function (err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", { error: err });
                    } else {
                        res.send(html);
                    }
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).render("error", { error: err });
        }
    } else if (req.user.isAdmin === false) {
        try {
            var eduvents = {
                en: [],
                ar: []
            };
            var chartData = {
                names: [],
                scores: []
            };

            eduvents.en = await Eduvent.find();
            eduvents.ar = await EduventAr.find();
            allUsers = await User.find();

            allUsers.forEach(function (user) {
                if (user.isAdmin === false) {
                    chartData.names.push(user.username);
                    if (user.score === null || user.score === undefined) {
                        user.score = 0;
                    };
                    chartData.scores.push(user.score);
                };
            });

            var types = await Type.find();
            var locations = await Location.find();
            var initiatives = await Initiative.find();

            if (typeof req.query.msg !== "undefined") {
                res.render("index", { locations: locations, types: types, initiatives: initiatives, username: req.user.username, volunteers: req.user.volunteers, userId: req.user._id.toHexString(), isAdmin: false, eduvents: eduvents, chartData: chartData, msg: req.query.msg }, function (err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", { error: err });
                    } else {
                        res.send(html);
                    }
                });
            } else {
                res.render("index", { locations: locations, types: types, initiatives: initiatives, username: req.user.username, volunteers: req.user.volunteers, userId: req.user._id.toHexString(), isAdmin: false, eduvents: eduvents, chartData: chartData }, function (err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", { error: err });
                    } else {
                        res.send(html);
                    }
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).render("error", { error: err });
        };
    } else {
        res.redirect("/login");
    }
});

app.get("/edu-vents/en/:id", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await Eduvent.findOne({ _id: req.params.id });
        var types = await Type.find();
        var locations = await Location.find();
        var initiative = await Initiative.findById(eduvent.initiative);
        res.render("view", { locations: locations, types: types, eduvent: eduvent, initiative: initiative, userId: req.user._id.toHexString(), isAdmin: req.user.isAdmin }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/edu-vents/ar/:id", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await EduventAr.findOne({ _id: req.params.id });
        var types = await Type.find();
        var locations = await Location.find();
        var initiative = await Initiative.findById(eduvent.initiative);
        res.render("viewAr", { locations: locations, types: types, eduvent: eduvent, initiative: initiative, userId: req.user._id.toHexString(), isAdmin: req.user.isAdmin }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/users", isLoggedIn, async function (req, res) {
    try {
        var user = {
            username: req.body.username.replace(/ /g, "").toLowerCase(),
        }

        if (req.body.isAdmin === "true") {
            user.isAdmin = true;
        } else {
            user.isAdmin = false;
            user.volunteers = [];
            var researchers = req.body.Rnames.split(",");
            var writers = req.body.Wnames.split(",");
            researchers.forEach(function (researcher) {
                user.volunteers.push({
                    name: researcher.trim(),
                    time: 0,
                    Vtype: "researcher"
                });
            });
            writers.forEach(function (writer) {
                user.volunteers.push({
                    name: writer.trim(),
                    time: 0,
                    Vtype: "writer"
                });
            });
        };

        await User.register(new User(user), req.body.password);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/users/:id/edit", isLoggedIn, async function (req, res) {
    try {
        var user = await User.findById(req.params.id);
        res.render("editUser", { user: user }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.patch("/users/:id", isLoggedIn, async function (req, res) {
    try {
        var user = await User.findById(req.params.id);

        if (req.body.isAdmin === "true") {
            user.username = req.body.username.replace(/ /g, "").toLowerCase();
            user.isAdmin = true;
        } else {
            user.isAdmin = false;
            user.volunteers = eval(req.body.volunteers);
            if (typeof req.body.score === "string" && req.body.score !== "") {
                user.score = Number(req.body.score);
            }
        }
        user.save();

        if (req.body.cPassword === "yes") {
            user.setPassword(req.body.password).then(function (sanitizedUser) {
                sanitizedUser.setPassword(req.body.password, function () {
                    sanitizedUser.save();
                });
            });
        }

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

/*app.delete("/users/:id/delete", isLoggedIn, async function (req, res) {
    try {
        await User.findByIdAndRemove(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});*/

app.get("/users/report", isLoggedIn, async function (req, res) {
    try {
        var users = await User.find();
        var data = JSON.stringify(users);
        fs.writeFileSync("./uploads/user-report.json", data, 'utf-8');
        res.download("./uploads/user-report.json", function (err) {
            if (err) {
                console.log(err);
            }
            fs.unlinkSync("./uploads/user-report.json");
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/edu-vents", isLoggedIn, upload, async function (req, res) {
    try {
        if (req.body.name === "" || req.body.type === "Any" || req.body.description === "" || req.body.urltoapp === "" || req.body.nameAr === "" || req.body.typeAr === "الكل" || req.body.descriptionAr === "") {
            res.redirect("/?msg=please fill all required fields");
        } else {
            var newEduvent = {
                name: req.body.name,
                type: req.body.type,
                imgPath: req.file.filename,
                description: req.body.description,
                startDate: req.body.date,
                endDate: req.body.endDate,
                location: req.body.location,
                googleMaps: req.body.googleMaps.replace(/ /g, ""),
                locationInfo: req.body.locationInfo,
                urltoapp: req.body.urltoapp.replace(/ /g, ""),
                userId: req.user._id,
            };

            var newEduventAr = {
                name: req.body.nameAr,
                type: req.body.typeAr,
                imgPath: req.file.filename,
                description: req.body.descriptionAr,
                startDate: req.body.date,
                endDate: req.body.endDate,
                location: req.body.locationAr,
                googleMaps: req.body.googleMaps.replace(/ /g, ""),
                locationInfo: req.body.locationInfoAr,
                urltoapp: req.body.urltoapp.replace(/ /g, ""),
                userId: req.user._id,
            }

            if (req.body.initiative !== "none") {
                var initiative = Initiative.findOne({name: req.body.initiative});
                newEduvent.initiative = initiative._id;
                newEduventAr.initiative = initiative._id
            }

            for (var key of Object.keys(newEduvent)) {
                if (newEduvent[key] === "" || newEduvent[key] === "Any" || typeof newEduvent[key] === "undefined") {
                    delete newEduvent[key];
                }
            }

            for (var key of Object.keys(newEduventAr)) {
                if (newEduventAr[key] === "" || newEduventAr[key] === "الكل" || typeof newEduventAr[key] === "undefined") {
                    delete newEduventAr[key];
                }
            }

            await User.findOneAndUpdate({ _id: req.user._id }, { $inc: { "score": 1 } });
            await Eduvent.create(newEduvent);
            await EduventAr.create(newEduventAr);

            res.redirect("/");
        };
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
        await Eduvent.deleteOne(newEduvent);
        await EduventAr.deleteOne(newEduventAr);
        fs.unlinkSync("./public/uploads/" + newEduvent.imgPath);
    }
});

app.delete("/edu-vents/en/:id/delete", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await Eduvent.findOne({ _id: req.params.id });
        var count = await EduventAr.countDocuments({ imgPath: eduvent.imgPath });
        await Eduvent.deleteOne({ _id: req.params.id });

        if (count < 1) {
            if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
            };
        };

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.delete("/edu-vents/ar/:id/delete", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await EduventAr.findOne({ _id: req.params.id });
        var count = await Eduvent.countDocuments({ imgPath: eduvent.imgPath });
        await EduventAr.deleteOne({ _id: req.params.id });

        if (count < 1) {
            if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
            };
        };

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/edu-vents/en/:id/edit", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await Eduvent.findOne({ _id: req.params.id });
        var types = await Type.find();
        var locations = await Location.find();
        var initiatives = await Initiative.find();
        var initiative = await Initiative.findById(eduvent.initiative);
        res.render("edit", { locations: locations, types: types, initiative: initiative, initiatives: initiatives, eduvent: eduvent }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.patch("/edu-vents/en/:id", isLoggedIn, upload, async function (req, res) {
    try {
        var edits = {
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            startDate: req.body.date,
            endDate: req.body.endDate,
            location: req.body.location,
            googleMaps: req.body.googleMaps.replace(/ /g, ""),
            locationInfo: req.body.locationInfo,
            urltoapp: req.body.urltoapp.replace(/ /g, ""),
        };

        if (req.body.initiative !== "none") {
            var initiative = await Initiative.findOne({name: req.body.initiative});
            edits.initiative = initiative._id
        }

        for (var key of Object.keys(edits)) {
            if (edits[key] === "" || edits[key] === "Any" || typeof edits[key] === "undefined") {
                delete edits[key];
            }
        }

        if (req.body.changePic === "yes") {
            edits.imgPath = req.file.filename;

            var eduvent = await Eduvent.findOne({ _id: req.params.id });
            var count = await EduventAr.countDocuments({ imgPath: eduvent.imgPath });
            if (count < 1) {
                if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                    fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                };
            };
        };
        await Eduvent.findByIdAndUpdate(req.params.id, edits);

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/edu-vents/ar/:id/edit", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await EduventAr.findOne({ _id: req.params.id });
        var types = await Type.find();
        var locations = await Location.find();
        var initiatives = await Initiative.find();
        var initiative = await Initiative.findById(eduvent.initiative);
        res.render("editAr", { locations: locations, types: types, initiative: initiative, initiatives: initiatives, eduvent: eduvent }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.patch("/edu-vents/ar/:id", isLoggedIn, upload, async function (req, res) {
    try {
        var edits = {
            name: req.body.nameAr,
            type: req.body.typeAr,
            description: req.body.descriptionAr,
            startDate: req.body.date,
            endDate: req.body.endDate,
            location: req.body.locationAr,
            googleMaps: req.body.googleMaps.replace(/ /g, ""),
            locationInfo: req.body.locationInfoAr,
            urltoapp: req.body.urltoapp.replace(/ /g, ""),
        };

        if (req.body.initiative !== "لا شيء") {
            var initiative = await Initiative.findOne({nameAr: req.body.initiative});
            edits.initiative = initiative._id
        }

        for (var key of Object.keys(edits)) {
            if (edits[key] === "" || edits[key] === "Any" || typeof edits[key] === "undefined") {
                delete edits[key];
            }
        }

        if (req.body.changePic === "yes") {
            edits.imgPath = req.file.filename;

            var eduvent = await EduventAr.findOne({ _id: req.params.id });
            var count = await Eduvent.countDocuments({ imgPath: eduvent.imgPath });
            if (count < 1) {
                if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                    fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                };
            };
        };
        await EduventAr.findByIdAndUpdate(req.params.id, edits);

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/edu-vents/en/:id/feature", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await Eduvent.findOne({ _id: req.params.id });
        if (typeof req.body.featuredUntil === "string" && req.body.featuredUntil !== "") {
            await Eduvent.findByIdAndUpdate(req.params.id, { featuredUntil: new Date(req.body.featuredUntil) });
        } else {
            if (typeof eduvent.endDate !== "undefined") {
                await Eduvent.findByIdAndUpdate(req.params.id, { featuredUntil: eduvent.endDate });
            } else if (typeof eduvent.startDate !== "undefined") {
                await Eduvent.findByIdAndUpdate(req.params.id, { featuredUntil: eduvent.startDate });
            } else {
                dt = new Date;
                dt.setDate(dt.getDate() + 3);
                await Eduvent.findByIdAndUpdate(req.params.id, { featuredUntil: dt });
            }
        }

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/edu-vents/ar/:id/feature", isLoggedIn, async function (req, res) {
    try {
        var eduvent = await EduventAr.findOne({ _id: req.params.id });
        if (typeof req.body.featuredUntil === "string" && req.body.featuredUntil !== "") {
            await EduventAr.findByIdAndUpdate(req.params.id, { featuredUntil: new Date(req.body.featuredUntil) });
        } else {
            if (typeof eduvent.endDate !== "undefined") {
                await EduventAr.findByIdAndUpdate(req.params.id, { featuredUntil: eduvent.endDate });
            } else if (typeof eduvent.startDate !== "undefined") {
                await EduventAr.findByIdAndUpdate(req.params.id, { featuredUntil: eduvent.startDate });
            } else {
                dt = new Date;
                dt.setDate(dt.getDate() + 3);
                await EduventAr.findByIdAndUpdate(req.params.id, { featuredUntil: dt });
            }
        }

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/forms", isLoggedIn, formUpload, async function (req, res) {
    try {
        var newForm = {
            name: req.body.name,
            endDate: new Date(req.body.endDate),
            url: req.body.name.toLowerCase().replace(/ /g, "").replace(/[^a-zA-Z0-9-_\.]/g, ''),
            responses: [],
            isOpen: false
        }
        var data = fs.readFileSync("./uploads/" + req.file.filename, 'utf-8');
        var html = data.replace(/<\s*form[^>]*>/g, `<form action="/forms/${newForm.url}" method="POST" enctype="multipart/form-data" id="mainForm" onsubmit="return submitForm()" data-expires="${newForm.endDate}">`);
        newForm.html = html;
        fs.unlinkSync("./uploads/" + req.file.filename);
        await Form.create(newForm);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
        await Form.deleteOne(newEduvent);
    }
});

app.get("/forms/:url/edit", isLoggedIn, async function (req, res) {
    try {
        var form = await Form.findOne({ url: req.params.url });
        var forms = await Form.find();
        var formNames = [];
        if (typeof forms === "object") {
            forms.forEach(function (oneForm) {
                formNames.push(oneForm.url.substring(0, oneForm.url.length - 4));
            });
            formNames = formNames.join(",");
            res.render("editForm", { form: form, formNames: formNames }, function (err, html) {
                if (err) {
                    console.log(err);
                    res.render("error", { error: err });
                } else {
                    res.send(html);
                }
            });
        } else {
            res.render("editForm", { form: form }, function (err, html) {
                if (err) {
                    console.log(err);
                    res.render("error", { error: err });
                } else {
                    res.send(html);
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.patch("/forms/:url", isLoggedIn, async function (req, res) {
    try {
        var form = await Form.findOne({ url: req.params.url });
        form.name = req.body.name;
        form.endDate = new Date(req.body.endDate);
        form.url = req.body.name.toLowerCase().replace(/ /g, "").replace(/[^a-zA-Z0-9-_\.]/g, '');
        form.html = req.body.code;
        form.save();
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/forms/:url/open", isLoggedIn, async function (req, res) {
    try {
        await Form.updateOne({ url: req.params.url }, { "$set": { "isOpen": true } });
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/forms/:url/close", isLoggedIn, async function (req, res) {
    try {
        await Form.updateOne({ url: req.params.url }, { "$set": { "isOpen": false } });
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/forms/:url/responses", isLoggedIn, async function (req, res) {
    try {
        var form = await Form.findOne({ url: req.params.url });
        res.render("viewForm", { form: form }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.delete("/forms/:url/delete", isLoggedIn, async function (req, res) {
    try {
        var form = await Form.findOne({ url: req.params.url });
        form.responses.forEach(function (response) {
            response.files.forEach(function (file) {
                fs.unlinkSync("./public/form uploads/" + file[1]);
            });
        });
        form.remove();
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/forms/:url/report", isLoggedIn, async function (req, res) {
    try {
        var form = await Form.findOne({ url: req.params.url });
        var data = JSON.stringify(form);
        fs.writeFileSync("./uploads/form-report.json", data, 'utf-8');
        res.download("./uploads/form-report.json", function (err) {
            if (err) {
                console.log(err);
            }
            fs.unlinkSync("./uploads/form-report.json");
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/types", isLoggedIn, async function (req, res) {
    try {
        var newType = {
            en: req.body.typeEn.replace(/\s*$/, ''),
            ar: req.body.typeAr.replace(/\s*$/, '')
        }
        await Type.create(newType);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.delete("/types/:id/delete", isLoggedIn, async function (req, res) {
    try {
        await Type.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/locations", isLoggedIn, async function (req, res) {
    try {
        var newLocation = {
            en: req.body.locationEn.replace(/\s*$/, ''),
            ar: req.body.locationAr.replace(/\s*$/, '')
        }
        await Location.create(newLocation);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.delete("/locations/:id/delete", isLoggedIn, async function (req, res) {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/initiatives", isLoggedIn, upload, async function (req, res) {
    try {
        if (req.body.name === "" || req.body.description === "" || req.body.url === "" || req.body.nameAr === "" || req.body.descriptionAr === "") {
            res.redirect("/?msg=please fill all required fields");
        } else {
            var newInitiative = {
                name: req.body.name,
                description: req.body.description,
                nameAr: req.body.nameAr,
                descriptionAr: req.body.descriptionAr,
                url: req.body.url,
                imgPath: req.file.filename,
            }
            await Initiative.create(newInitiative);
            res.redirect("/");
        }
    } catch (err) {
        console.log(err);
        res.status(500).render("error", { error: err });
        await Initiative.deleteOne(newEduvent);
        await Initiative.deleteOne(newEduventAr);
        fs.unlinkSync("./public/uploads/" + newEduvent.imgPath);
    }
});

app.get("/initiatives/:id/edit", isLoggedIn, async function (req, res) {
    try {
        var initiative = await Initiative.findById(req.params.id);
        res.render("editInitiative", { initiative: initiative }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).render("error", { error: err });
    }
});

app.patch("/initiatives/:id", isLoggedIn, upload, async function (req, res) {
    try {
        var initiative = await Initiative.findById(req.params.id);
        initiative.name = req.body.name;
        initiative.description = req.body.description;
        initiative.nameAr = req.body.nameAr;
        initiative.descriptionAr = req.body.descriptionAr;
        initiative.url = req.body.url;
        if (req.body.changePic === "yes") {
            if (fs.existsSync("./public/uploads/" + initiative.imgPath)) {
                fs.unlinkSync("./public/uploads/" + initiative.imgPath);
            };
            initiative.imgPath = req.file.filename;
        };
        initiative.save();
        res.redirect("/")
    } catch (err) {
        console.log(err);
        res.status(500).render("error", { error: err });
    }
});

app.delete("/initiatives/:id/delete", async function(req, res) {
    try {
        await Initiative.findByIdAndRemove(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("/timer", isLoggedIn, async function (req, res) {
    try {
        res.render("timer.ejs", { user: req.user }, function (err, html) {
            if (err) {
                console.log(err);
                res.render("error", { error: err });
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.post("/timer", isLoggedIn, async function (req, res) {
    try {
        var EstTime = parseInt(req.body.time);
        var user = await User.findOne({ _id: req.user._id });
        user.volunteers.forEach(function (volunteer) {
            if (req.body.id === volunteer._id.toString()) {
                volunteer.time += EstTime;
            }
        });
        user.save();
        res.status(200).send("/?msg=your estimated time: " + EstTime);
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: err });
    }
});

app.get("*", function (req, res) {
    res.redirect("/?msg=404");
});

app.listen(8081, () => {
    console.log("EDU-vents server started");
});

var j = schedule.scheduleJob("0 0 * * *", () => {
    var now = new Date();

    Eduvent.find({}, function (err, allEduvents) {
        if (err) {
            console.error(err);
        };

        var target;
        var targetEduvent = {};

        allEduvents.forEach(function (eduvent) {
            if (typeof eduvent.endDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else if (typeof eduvent.startDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else {
                target = now;
            }

            if (now > target) {
                EduventAr.countDocuments({ imgPath: eduvent.imgPath }, function (err, count) {
                    if (count < 1) {
                        if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                            fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                        };
                    };
                });

                Eduvent.deleteOne({ _id: eduvent._id }, function (err) {
                    if (err) {
                        console.error(err);
                    };
                });
            };
        });
    });

    EduventAr.find({}, function (err, allEduvents) {
        if (err) {
            console.error(err);
        };

        var target;
        var targetEduvent = {};

        allEduvents.forEach(function (eduvent) {
            if (typeof eduvent.endDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else if (typeof eduvent.startDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else {
                target = now;
            }

            if (now > target) {
                Eduvent.countDocuments({ imgPath: eduvent.imgPath }, function (err, count) {
                    if (count < 1) {
                        if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                            fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                        };
                    };
                });

                EduventAr.deleteOne({ _id: eduvent._id }, function (err) {
                    if (err) {
                        console.error(err);
                    };
                });
            };
        });
    });
});