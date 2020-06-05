const express               = require("express");
const methodOverride        = require("method-override");
const bodyParser            = require("body-parser");
const mongoose              = require("mongoose");
const passport              = require("passport");
const fs                    = require("fs");
const path                  = require("path");
const multer                = require("multer");
const schedule              = require("node-schedule");
const helmet                = require("helmet");
const LocalStrategy         = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session               = require("express-session");
const User                  = require("./models/user");
const Eduvent               = require("./models/eduvent");
const EduventAr             = require("./models/eduventAr");

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(helmet());

mongoose.connect("mongodb://localhost:27017/EDU-vents", {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => {console.log(error)});
mongoose.set("useFindAndModify", false);

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage}).single("img");

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

app.get("/login", function(req, res) {
    res.render("login", function(err, html) {
        if (err) {
            console.log(err);
            res.render("error", {error: err});
        } else {
            res.send(html);
        }
    });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}));

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

app.get("/resetstuff", isLoggedIn, async function(req, res) {
    try {
        if (req.user.isAdmin === true) {
            await User.updateMany({}, {"$set": {"score": 0}});
            await User.updateMany({}, {"$set": {"researcher.time" : 0}});
            await User.updateMany({}, {"$set": {"writer.time" : 0}});
            res.send("success");
        } else {
            res.send("FUCK OFF");
        }
    } catch(err) {
        console.log(err);
        res.send("ERROR");
    }
});

app.get("/", isLoggedIn, async function(req, res) {
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
    
            eduvents.en = await Eduvent.find();
            eduvents.ar = await EduventAr.find();
            allUsers = await User.find();
    
            allUsers.forEach(function(user) {
                if (user.isAdmin === false) {
                    chartData.names.push(user.username);
                    if (user.score === null || user.score === undefined) {
                        user.score = 0;
                    };
                    chartData.scores.push(user.score);
                };
            });

            var users = await User.find();

            if (typeof req.query.msg !== "undefined") {
                res.render("index", {users: users, username: req.user.username, isAdmin: true, eduvents: eduvents, chartData: chartData, msg: req.query.msg}, function(err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", {error: err});
                    } else {
                        res.send(html);
                    }
                });
            } else {
                res.render("index", {users: users, username: req.user.username, isAdmin: true, eduvents: eduvents, chartData: chartData}, function(err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", {error: err});
                    } else {
                        res.send(html);
                    }
                });
            }
        } catch(err) {
            console.log(err);
            res.render("error", {error: err});
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
    
            allUsers.forEach(function(user) {
                if (user.isAdmin === false) {
                    chartData.names.push(user.username);
                    if (user.score === null || user.score === undefined) {
                        user.score = 0;
                    };
                    chartData.scores.push(user.score);
                };
            });
    
            if (typeof req.query.msg !== "undefined") {
                res.render("index", {username: req.user.username, userId: req.user._id.toHexString(), isAdmin: false, eduvents: eduvents, chartData: chartData, msg: req.query.msg}, function(err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", {error: err});
                    } else {
                        res.send(html);
                    }
                });
            } else {
                res.render("index", {username: req.user.username, userId: req.user._id.toHexString(), isAdmin: false, eduvents: eduvents, chartData: chartData}, function(err, html) {
                    if (err) {
                        console.log(err);
                        res.render("error", {error: err});
                    } else {
                        res.send(html);
                    }
                });
            }
        } catch(err) {
            console.log(err);
            res.render("error", {error: err});
        };
    } else {
        res.redirect("/login");
    }
});

app.get("/edu-vents/en/:id", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await Eduvent.findOne({_id: req.params.id});
        res.render("view", {eduvent: eduvent, userId: req.user._id.toHexString(), isAdmin: req.user.isAdmin}, function(err, html) {
            if (err) {
                console.log(err);
                res.render("error", {error: err});
            } else {
                res.send(html);
            }
        });
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.get("/edu-vents/ar/:id", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await EduventAr.findOne({_id: req.params.id});
        res.render("viewAr", {eduvent: eduvent, userId: req.user._id.toHexString(), isAdmin: req.user.isAdmin}, function(err, html) {
            if (err) {
                console.log(err);
                res.render("error", {error: err});
            } else {
                res.send(html);
            }
        });
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.post("/user", isLoggedIn, async function(req, res) {
    try {
        var user = {
            username: req.body.username,
        }
        
        if (req.body.isAdmin === "true") {
            user.isAdmin = true;
        } else {
            user.isAdmin = false;
            user.researcher = { name: req.body.Rname };
            user.writer = { name: req.body.Wname }
        };
        
        await User.register(new User(user), req.body.password);
        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.delete("/user/:id/delete", isLoggedIn, async function(req, res) {
    try {
        await User.findByIdAndRemove(req.params.id);
        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.post("/edu-vents", isLoggedIn, upload, async function(req, res) {
    try {
        if (req.body.name === "" || req.body.type === "Any" || req.body.description === "" || req.body.urltoapp === "" || req.body.nameAr === "" || req.body.typeAr === "الكل" || req.body.descriptionAr === "" || (req.body.date === "" && req.body.endDate === "")) {
            if (req.body.date === "" && req.body.endDate === "") {
                res.redirect("/?msg=please fill at least one date field and all required fields.");
            } else {
                res.redirect("/?msg=please fill all required fields");
            }
        } else {
            var newEduvent = {
                name: req.body.name,
                type: req.body.type,
                imgPath: req.file.filename,
                description: req.body.description,
                startDate: req.body.date,
                endDate: req.body.endDate,
                location: req.body.location,
                googleMaps: req.body.googleMaps,
                locationInfo: req.body.locationInfo,
                urltoapp: req.body.urltoapp,
                userId: req.user._id
            };
        
            var newEduventAr = {
                name: req.body.nameAr,
                type: req.body.typeAr,
                imgPath: req.file.filename,
                description: req.body.descriptionAr,
                startDate: req.body.date,
                endDate: req.body.endDate,
                location: req.body.locationAr,
                googleMaps: req.body.googleMaps,
                locationInfo: req.body.locationInfoAr,
                urltoapp: req.body.urltoapp,
                userId: req.user._id
            }

            for (var key of Object.keys(newEduvent)) {
                if (newEduvent[key] === "" || newEduvent[key] === "Any") {
                    delete newEduvent[key];
                }
            }

            for (var key of Object.keys(newEduventAr)) {
                if (newEduventAr[key] === "" || newEduventAr[key] === "الكل") {
                    delete newEduventAr[key];
                }
            }

            await User.findOneAndUpdate({_id: req.user._id}, {$inc : {"score" : 1}});
            await Eduvent.create(newEduvent);
            await EduventAr.create(newEduventAr);
                
            res.redirect("/");
        };
    } catch (err) {
        console.log(err);
        res.render("error", {error: err});
        await Eduvent.deleteOne(newEduvent);
        await EduventAr.deleteOne(newEduventAr);
        fs.unlinkSync("./public/uploads/" + newEduvent.imgPath);
    }
});

app.delete("/edu-vents/en/:id", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await Eduvent.findOne({_id: req.params.id});
        var count = await EduventAr.countDocuments({imgPath: eduvent.imgPath});
        await Eduvent.deleteOne({_id: req.params.id});

        if (count < 1) {
            if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
            };
        };

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.delete("/edu-vents/ar/:id", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await EduventAr.findOne({_id: req.params.id});
        var count = await Eduvent.countDocuments({imgPath: eduvent.imgPath});
        await EduventAr.deleteOne({_id: req.params.id});

        if (count < 1) {
            if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
            };
        };

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.get("/edu-vents/en/:id/edit", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await Eduvent.findOne({_id: req.params.id});
        res.render("edit", {eduvent: eduvent}, function(err, html) {
            if (err) {
                console.log(err);
                res.render("error", {error: err});
            } else {
                res.send(html);
            }
        });
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.patch("/edu-vents/en/:id", isLoggedIn, upload, async function(req, res) {
    try {
        var edits = {
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            startDate: req.body.date,
            endDate: req.body.endDate,
            location: req.body.location,
            googleMaps: req.body.googleMaps,
            locationInfo: req.body.locationInfo,
            urltoapp: req.body.urltoapp
        };

        for (var key of Object.keys(edits)) {
            if (edits[key] === "" || edits[key] === "Any") {
                delete edits[key];
            }
        }
        
        if (req.body.changePic === "yes") {
            edits.imgPath = req.file.filename;
        
            var eduvent = await Eduvent.findOne({_id: req.params.id});
            var count = await EduventAr.countDocuments({imgPath: eduvent.imgPath});
            if (count < 1) {
                if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                    fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                };
            };
        };
        await Eduvent.findByIdAndUpdate(req.params.id, edits);

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.get("/edu-vents/ar/:id/edit", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await EduventAr.findOne({_id: req.params.id});
        res.render("editAr", {eduvent: eduvent}, function(err, html) {
            if (err) {
                console.log(err);
                res.render("error", {error: err});
            } else {
                res.send(html);
            }
        });
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.patch("/edu-vents/ar/:id", isLoggedIn, upload, async function(req, res) {
    try {
        var edits = {
            name: req.body.nameAr,
            type: req.body.typeAr,
            description: req.body.descriptionAr,
            startDate: req.body.date,
            endDate: req.body.endDate,
            location: req.body.locationAr,
            googleMaps: req.body.googleMaps,
            locationInfo: req.body.locationInfoAr,
            urltoapp: req.body.urltoapp
        };

        for (var key of Object.keys(edits)) {
            if (edits[key] === "" || edits[key] === "Any") {
                delete edits[key];
            }
        }
        
        if (req.body.changePic === "yes") {
            edits.imgPath = req.file.filename;
        
            var eduvent = await EduventAr.findOne({_id: req.params.id});
            var count = await Eduvent.countDocuments({imgPath: eduvent.imgPath});
            if (count < 1) {
                if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                    fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                };
            };
        };
        await EduventAr.findByIdAndUpdate(req.params.id, edits);

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err}); 
    }
});

app.get("/edu-vents/en/:id/feature", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await Eduvent.findOne({_id: req.params.id});
        if (typeof eduvent.endDate !== "undefined") {
            await Eduvent.findByIdAndUpdate(req.params.id, {featuredUntil: eduvent.endDate});
        } else if (typeof eduvent.startDate !== "undefined") {
            await Eduvent.findByIdAndUpdate(req.params.id, {featuredUntil: eduvent.startDate});
        } else {
            dt = new Date;
            dt.setDate(dt.getDate() + 3);
            await Eduvent.findByIdAndUpdate(req.params.id, {featuredUntil: dt});
        }

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err}); 
    }
});

app.get("/edu-vents/ar/:id/feature", isLoggedIn, async function(req, res) {
    try {
        var eduvent = await EduventAr.findOne({_id: req.params.id});
        if (typeof eduvent.endDate !== "undefined") {
            await EduventAr.findByIdAndUpdate(req.params.id, {featuredUntil: eduvent.endDate});
        } else if (typeof eduvent.startDate !== "undefined") {
            await EduventAr.findByIdAndUpdate(req.params.id, {featuredUntil: eduvent.startDate});
        } else {
            dt = new Date;
            dt.setDate(dt.getDate() + 3);
            await EduventAr.findByIdAndUpdate(req.params.id, {featuredUntil: dt});
        }

        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.get("/timer", isLoggedIn, async function(req, res) {
    try {
        res.render("timer.ejs", {user: req.user}, function(err, html) {
            if (err) {
                console.log(err);
                res.render("error", {error: err});
            } else {
                res.send(html);
            }
        });
    } catch(err) {
        console.log(err);
        res.render("error", {error: err});
    }
});

app.post("/timer", isLoggedIn, async function(req, res) {
    try {
        var EstTime = parseInt(req.body.time);
        if (req.body.role === "researcher") {
            await User.findOneAndUpdate({_id: req.user._id}, {$inc : {"researcher.time" : EstTime}});
        } else if (req.body.role === "writer") {
            await User.findOneAndUpdate({_id: req.user._id}, {$inc : {"writer.time" : EstTime}});
        }
        res.send("/?msg=your estimated time: " + EstTime);
    } catch(err) {
        console.log(err);
        res.send("/timer/error?error=" + err + "&time=" + EstTime);
    }
});

app.get("/timer/error", isLoggedIn, async function(req, res) {
    try {
        res.render("error", {error: req.query.error + "\ntime: " + req.query.time});
    } catch(err) {
        console.log(err);
        console.log();
        res.render("error", {error: err})
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

    Eduvent.find({}, function(err, allEduvents) {
        if (err) {
            console.log(err);
        };

        var target;
        var targetEduvent = {};

        allEduvents.forEach(function(eduvent) {
            if (typeof eduvent.endDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else if (typeof eduvent.startDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else {
                target = now;
            }

            if (now > target) {
                EduventAr.countDocuments({imgPath: eduvent.imgPath}, function(err, count) {
                    if (count < 1) {
                        if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                            fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                        };
                    };
                });

                Eduvent.deleteOne({_id: eduvent._id}, function(err) {
                    if (err) {
                        console.log(err);
                    };
                });
            };
        });
    });

    EduventAr.find({}, function(err, allEduvents) {
        if (err) {
            console.log(err);
        };

        var target;
        var targetEduvent = {};

        allEduvents.forEach(function(eduvent) {
            if (typeof eduvent.endDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else if (typeof eduvent.startDate !== "undefined") {
                target = new Date(eduvent.endDate);
            } else {
                target = now;
            }

            if (now > target) {
                Eduvent.countDocuments({imgPath: eduvent.imgPath}, function(err, count) {
                    if (count < 1) {
                        if (fs.existsSync("./public/uploads/" + eduvent.imgPath)) {
                            fs.unlinkSync("./public/uploads/" + eduvent.imgPath);
                        };
                    };
                });

                EduventAr.deleteOne({_id: eduvent._id}, function(err) {
                    if (err) {
                        console.log(err);
                    };
                });
            };
        });
    });
});