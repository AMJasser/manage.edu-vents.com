const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Eduvent = require("../models/Eduvent");

const dailyDelete = asyncHandler(async () => {
    const eduvents = await Eduvent.find();
    const today = Date.now();
    let target;

    eduvents.forEach(function(eduvent) {
        if (eduvent.endDate) {
            target = eduvent.endDate;
        } else if (eduvent.date) {
            target = eduvent.date;
        }

        if (target && today > target) {
            eduvent.remove();
        }
    });
});

module.exports = dailyDelete;