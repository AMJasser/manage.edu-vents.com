const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const Team = require("../models/Team");

// @desc    get single team
// @route   GET /teams/:id
// @access   Private/Admin
exports.getTeam = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    viewResponse("view/teams", { team }, res, next);
});

// @desc    create team
// @route   POST /teams
// @access   Private/Admin
exports.createTeam = asyncHandler(async (req, res, next) => {
    await Team.create(req.body);

    res.status(200).redirect("/");
});

// @desc    get update page
// @route   GET /teams/:id/edit
// @access   Private/Admin
exports.getUpdate = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    viewResponse("edit/teams", { team }, res, next);
});

// @desc    edit team
// @route   PUT /team/:id
// @access   Private/Admin
exports.updateTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);
    
    Object.keys(team.schema.paths).forEach(function(field) {
        if (field !== "__v" && field !== "_id") {
            field = field.split(".");
            if (field.length === 1) {
                team[field[0]] = req.body[field[0]];
            } else {
                team[field[0]][field[1]] = req.body[field[0] + "." + field[1]];
            }
        }
    });

    team.save();

    res.status(200).redirect("/");
});

// @desc    delete team
// @route   DELETE /edu-vents/:id
// @access   Private/Admin
exports.deleteTeam = asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        return next(new ErrorResponse(`Team with id ${req.params.id} not found`, 404));
    }

    team.remove();

    res.status(200).redirect("/");
});