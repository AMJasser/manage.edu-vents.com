const express = require("express");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const Eduvent = require("../models/Eduvent");
const Initiative = require("../models/Initiative");
const Team = require("../models/Team");
const types = require("../utils/types");

const router = express.Router();

const { protect } = require("../middleware/auth");
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

    viewResponse("index", { user: req.user, chartData, types, initiatives, eduvents, users }, res);
}));

module.exports = router;