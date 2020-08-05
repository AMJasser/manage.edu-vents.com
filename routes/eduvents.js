const express = require("express");
const { 
    getEduvent,
} = require("../controllers/eduvents");

const router = express.Router();

router
    .route("/:id")
    .get(getEduvent);

module.exports = router;