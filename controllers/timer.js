const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const User = require("../models/User");

// @desc    get single team
// @route   GET /teams/:id
exports.getPage = asyncHandler(async (req, res, next) => {
    viewResponse("timer", { user: req.user }, res, next);
});

// @desc    Submit time
// @route   POST /teams
exports.sendTime = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.body.id);

    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} not found. *PLEASE TAKE A PIC OF THIS PAGE AND SEND IT TO ALJASSER* Time: ${req.body.time}`, 404));
    }

    user.time += Number(req.body.time);

    user.save();

    res.redirect("/");
});