const express = require("express");
const {
    getPage,
    sendTime
} = require("../controllers/timer");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.use(protect);

router
    .route("/")
    .get(getPage)
    .post(sendTime);

module.exports = router;