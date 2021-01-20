const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

exports.create = (req, res, next) => {
    req.body.img = req.file.filename;
    next();
}

exports.edit = asyncHandler(async (Resource) => {
    try {
        const resource = await Resource.findById(req.params.id);

        return (req, res, next) => {
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
        }
    } catch (err) {
        console.error(err);
        return next(new ErrorResponse(`Error handling image`, 500));
    }
});