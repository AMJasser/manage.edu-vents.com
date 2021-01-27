const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const types = require("../utils/types");
const viewResponse = require("../utils/viewResponse");
const Eduvent = require("../models/Eduvent");
const Initiative = require("../models/Initiative");

// @desc    get single edu-vent
// @route   GET /edu-vents/:id
exports.getEduvent = asyncHandler(async (req, res, next) => {
    var eduvent = await Eduvent.findById(req.params.id).populate({
        path: "initiative",
        select: "name"
    });

    if (!eduvent) {
        return next(new ErrorResponse(`Edu-vent with id ${req.params.id} not found`, 404));
    }

    viewResponse("view/edu-vents", { eduvent, user: req.user }, res, next);
});

// @desc    create edu-vent
// @route   POST /edu-vents
exports.createEduvent = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;

    await Eduvent.create(req.body);

    res.status(200).redirect("/");
});

// @desc    get update page
// @route   GET /edu-vents/:id/edit
exports.getUpdate = asyncHandler(async (req, res, next) => {
    const eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`EDU-vent with id ${req.params.id} not found`, 404));
    }

    // Make sure user is edu-vent owner
    if (eduvent.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this EDU-vent`, 401));
    }

    const initiatives = await Initiative.find();

    viewResponse("edit/edu-vents", { eduvent, types, initiatives }, res, next);
});

// @desc    edit edu-vent
// @route   PUT /edu-vents/:id
exports.updateEduvent = asyncHandler(async (req, res, next) => {
    let eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`EDU-vent with id ${req.params.id} not found`, 404));
    }

    // Make sure user is edu-vent owner
    if (eduvent.user.toString() !== req.user.id.toString() && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this EDU-vent`, 401));
    }

    Object.keys(eduvent.schema.paths).forEach(function(field) {
        if (field !== "__v" && field !== "_id" && field !== "img" && field !== "clickCount" && field !== "user" && field !== "location.type") {
            field = field.split(".");
            if (field.length === 1) {
                eduvent[field[0]] = req.body[field[0]];
            } else {
                eduvent[field[0]][field[1]] = req.body[field[0] + "." + field[1]];
            }
        }
    });

    eduvent.save();

    res.status(200).redirect("/");
});

// @desc    delete edu-vent
// @route   DELETE /edu-vents/:id
exports.deleteEduvent = asyncHandler(async (req, res, next) => {
    const eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`EDU-vent with id ${req.params.id} not found`, 404));
    }

    // Make sure user is edu-vent owner
    if (eduvent.user.toString() !== req.user.id.toString() && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this EDU-vent`, 401));
    }

    eduvent.remove();

    res.status(200).redirect("/");
});