const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const tokenResponse = require("../utils/tokenResponse");
const viewResponse = require("../utils/viewResponse");
const User = require("../models/User");

// @desc    Get Login page
// @route   GET /login
exports.getLogin = asyncHandler(async (req, res, next) => {
    viewResponse("login", {}, res, next);
});

// @desc    Login
// @route   POST /login
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
        return next(new ErrorResponse("Please provide a username and password", 400));
    }

    // Check user
    const user = await User.findOne({ username: username }).select("+password");

    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    tokenResponse(user, 200, res);
});

// @desc    Logout
// @route   GET /logout
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).redirect("/");
});

// @desc    Update password
// @route   PUT /updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    tokenResponse(user, 200, res);
});