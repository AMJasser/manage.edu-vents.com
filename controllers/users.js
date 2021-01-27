const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const viewResponse = require("../utils/viewResponse");
const User = require("../models/User");
const Team = require("../models/Team");

// @desc    Create User
// @route   POST /users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    await User.create(req.body);

    res.status(200).redirect("/");
});

// @desc    Get update page
// @route   GET /users/:id/edit
// @access  Private/Admin
exports.getUpdate = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} not found`, 404));
    }

    const roles = user.schema.path("role").enumValues;
    const teams = await Team.find().select("name");

    viewResponse("edit/users", { user, roles, teams }, res, next);
});

// @desc    Update User
// @route   PUT /users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} not found`, 404));
    }

    //Tell if the edit includes a password
    if (req.body.cPassword === "no") {
        delete req.body.password;
    }
    delete req.body.cPassword

    Object.keys(user.schema.paths).forEach(function(field) {
        if (field !== "__v" && field !== "_id" && field !== "password") {
            field = field.split(".");
            if (field.length === 1) {
                user[field[0]] = req.body[field[0]];
            } else {
                user[field[0]][field[1]] = req.body[field[0] + "." + field[1]];
            }
        }
    });

    user.save();

    res.status(200).redirect("/");
});

// @desc    Delete User
// @route   DELETE /users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} not found`, 404));
    }

    user.remove();

    res.status(200).redirect("/");
});