const express = require("express");
const asyncHandler = require("../middleware/async");
const fs = require("fs");
const uuid = require("../utils/uuid");
const User = require("../models/User");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/", asyncHandler(async (req, res, next) => {
    const users = await User.find();

    const data = JSON.stringify(users);

    const fileName = "report-" + ((new Date).getMonth() + 1) + "-" + (new Date).getFullYear() + "-" + uuid() + ".json";

    await fs.writeFile("./public/reports/" + fileName, data, (err) => {
        if (err) throw err;
    });

    users.forEach(function(user) {
        user.score = 0;
        user.time = 0;

        user.save();
    });

    res.redirect("reports/" + fileName);
}));

module.exports = router;