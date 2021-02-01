const ErrorResponse = require("../utils/errorResponse");
const url = require("url");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to console for dev
    console.error(err.stack.red);

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    // Create redirect string
    let redirect = {
        pathname: "/",
        query: {
            msg: error.message || "Server Error"
        }
    }

    if (req.method === "POST" && req.url === "/edu-vents") {
        redirect.query.form = "eduventsForm";
        Object.keys(req.body).forEach(function(field) {
            console.log(field);
            if (field !== "user" && field !== "img") {
                redirect.query[field] = req.body[field];
            }
        });
    }

    if (req.method === "POST" && req.url === "/initiatives") {
        redirect.query.form = "initiativesForm";
        Object.keys(req.body).forEach(function(field) {
            if (field !== "user" && field !== "img") {
                redirect.query[field] = req.body[field];
            }
        });
    }

    if (req.method === "POST" && req.url === "/teams") {
        redirect.query.form = "teamsForm";
        Object.keys(req.body).forEach(function(field) {
            if (field !== "user" && field !== "img") {
                redirect.query[field] = req.body[field];
            }
        });
    }

    if (req.method === "POST" && req.url === "/users") {
        redirect.query.form = "usersForm";
        Object.keys(req.body).forEach(function(field) {
            if (field !== "user" && field !== "img") {
                redirect.query[field] = req.body[field];
            }
        });
    }

    res
        .status(error.statusCode || 500)
        .redirect(url.format(redirect));
}

module.exports = errorHandler;