const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const Initiative = require("../models/Initiative");

// @desc    create initiative
// @route   POST /initiatives
exports.createInitiative = asyncHandler(async (req, res, next) => {
    await Initiative.create(req.body);

    res.status(200).redirect("/");
});

// @desc    get update view
// @route   GET /initiatives/:id/edit
exports.getUpdate = asyncHandler(async (req, res, next) => {
    const initiative = await Initiative.findById(req.params.id);

    if (!initiative) {
        return next(new ErrorResponse(`Initiative with id ${req.params.id} not found`, 404));
    }

    viewResponse("edit/initiatives", { initiative }, res, next);
});

// @desc    Update initiative
// @route   PUT /initiatives/:id
exports.updateInitiative = asyncHandler(async (req, res, next) => {
    let initiative = await Initiative.findById(req.params.id);

    if (!initiative) {
        return next(new ErrorResponse(`Initiative with id ${req.params.id} not found`, 404));
    }

    Object.keys(initiative.schema.paths).forEach(function(field) {
        if (field !== "__v" && field !== "_id" && field !== "img") {
            field = field.split(".");
            if (field.length === 1) {
                initiative[field[0]] = req.body[field[0]];
            } else {
                initiative[field[0]][field[1]] = req.body[field[0] + "." + field[1]];
            }
        }
    });

    initiative.save();

    res.status(200).redirect("/");
});

// @desc    Delete initiative
// @route   DELETE /initiatives/:id
exports.deleteInitiative = asyncHandler(async (req, res, next) => {
    const initiative = await Initiative.findById(req.params.id);

    if (!initiative) {
        return next(new ErrorResponse(`Initiative with id ${req.params.id} not found`, 404));
    }

    initiative.remove();

    res.status(200).redirect("/");
});