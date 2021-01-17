const express = require("express");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Eduvent = require("../models/Eduvent");
const Initiative = require("../models/Initiative");
const Team = require("../models/Team");
const types = require("./utils/types");

const router = express.Router();

const { protect } = require("../middleware/auth");
const { type } = require("os");
const User = require("../models/User");

router.get("/", protect, asyncHandler(async (req, res, next) => {
    var chartData = {
        names: [],
        scores: []
    };

    const teams = await Team.find();
    const users = await User.find();
    const initiatives = await Initiative.find();
    const eduvents = await Eduvent.find();

    teams.forEach(function (team) {
        chartData.names.push(team.name);
        if (team.totalScore === null || team.totalScore === undefined) {
            team.score = 0;
        };
        chartData.scores.push(team.totalScore);
    });

    res.status(200).render("index", { user: req.user, chartData, types, initiatives, eduvents, users }, function(err, html) {
        if (err) {
            return next(new ErrorResponse(`Error rendering view`, 500));
        } else {
            res.send(html);
        }
    });
}));

module.exports = router;