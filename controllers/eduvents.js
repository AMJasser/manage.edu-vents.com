const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Eduvent = require("../models/Eduvent");

// @desc    get single edu-vent
// @route   GET /edu-vents/:id
exports.getEduvent = asyncHandler(async (req, res, next) => {
    var eduvent = await Eduvent.findById(req.params.id);

    if (!eduvent) {
        return next(new ErrorResponse(`Edu-vent with id ${req.params.id} not found`, 404));
    }
});

// @desc    create edu-vent
// @route   POST /edu-vents
exports.createEduvent = asyncHandler(async (req, res, next) => {
    await Eduvent.create(req.body);
});