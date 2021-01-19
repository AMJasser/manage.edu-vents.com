const fs = require("fs");
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
    req.body.img = req.file.filename;

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

    if (req.body.changePic === "yes") {
        req.body.img = req.file.filename;

        if (fs.existsSync("./public/uploads/" + eduvent.img)) {
            fs.unlinkSync("./public/uploads/" + eduvent.img);
        }
    }

    req.body.changePic = undefined;

    Object.keys(req.body).forEach(function(field) {
        eduvent[field] = req.body[field];
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