const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Eduvent = require("../models/Eduvent");

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

    res.status(200).render("view", { eduvent, user: req.user }, function(err, html) {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Error rendering view`, 500));
        } else {
            res.send(html);
        }
    });
});

// @desc    create edu-vent
// @route   POST /edu-vents
exports.createEduvent = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    req.body.img = req.file.filename;

    await Eduvent.create(req.body);

    res.status(200).redirect("/");
});

// @desc    edit edu-vent
// @route   PUT /edu-vents/:id
exports.updateEduvent = asyncHandler(async (req, res, next) => {
    let eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`EDU-vent with id ${req.params.id} not found`, 404));
    }

    // Make sure user is edu-vent owner
    if (eduvent.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this EDU-vent`, 401));
    }

    bootcamp = await Eduvent.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true
    });

    res.status(200);
});

// @desc    delete edu-vent
// @route   DELETE /edu-vents/:id
exports.deleteEduvent = asyncHandler(async (req, res, next) => {
    const eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`EDU-vent with id ${req.params.id} not found`, 404));
    }

    // Make sure user is edu-vent owner
    if (eduvent.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this EDU-vent`, 401));
    }

    eduvent.remove();

    res.status(200);
});