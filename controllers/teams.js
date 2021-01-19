const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const Team = require("../models/Team");

// @desc    get single team
// @route   GET /teams/:id
exports.getTeam = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    viewResponse("view/teams", { team }, res, next);
});

// @desc    create team
// @route   POST /teams
exports.createTeam = asyncHandler(async (req, res, next) => {
    await Team.create(req.body);

    res.status(200).redirect("/");
});

// @desc    get update page
// @route   GET /teams/:id/edit
exports.getUpdate = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    // Make sure user is admin
    if (req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update Team`, 401));
    }

    viewResponse("edit/teams", { team }, res, next);
});

// @desc    edit team
// @route   PUT /team/:id
exports.updateTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);

    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    // Make sure user is admin
    if (req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this Team`, 401));
    }

    Object.keys(req.body).forEach(function(field) {
        team[field] = req.body[field];
    });

    team.save();

    res.status(200).redirect("/");
});

// @desc    delete team
// @route   DELETE /edu-vents/:id
exports.deleteTeam = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    // Make sure user is admin
    if (req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this Team`, 401));
    }

    team.remove();

    res.status(200).redirect("/");
});