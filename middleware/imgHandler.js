const ErrorResponse = require("../utils/errorResponse");
const { asyncMiddleware } = require("middleware-async");
const fs = require("fs");

const picEdit = (Resource) => {
    return asyncMiddleware(async (req, res, next) => {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return next(new ErrorResponse(`Resource with id ${req.params.id} not found`, 404));
        }

        if (req.body.changePic === "yes") {
            if (fs.existsSync("./public/uploads/" + resource.img)) {
                fs.unlinkSync("./public/uploads/" + resource.img);
            }
            req.body.img = req.file.filename;
        } else {
            delete req.body.img
        }
        delete req.body.changePic;

        next();
    });
};

exports.create = (req, res, next) => {
    req.body.img = req.file.filename;
    next();
}

exports.edit = picEdit;