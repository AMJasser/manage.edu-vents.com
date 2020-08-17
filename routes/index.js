const express = require("express");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Eduvent = require("../models/Eduvent");
const Team = require("../models/Team");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.get("/", protect, asyncHandler(async (req, res, next) => {
    var chartData = {
        names: [],
        scores: []
    };

    var teams = await Team.find();
    teams.forEach(function (team) {
        if (user.role !== "admin") {
            chartData.names.push(team.name);
            if (user.score === null || user.score === undefined) {
                user.score = 0;
            };
            chartData.scores.push(team.totalScore);
        };
    });

    var types = {
        en: Eduvent.schema.path("type.en").enumValues,
        ar: Eduvent.schema.path("type.ar").enumValues
    }

    var users = await User.find();

    res.status(200);
}));

module.exports = router;