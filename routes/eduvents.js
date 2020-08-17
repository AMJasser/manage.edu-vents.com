const express = require("express");
const { 
    getEduvent,
    createEduvent,
    updateEduvent,
    deleteEduvent
} = require("../controllers/eduvents");

const Eduvent = require("../models/Eduvent");

const router = express.Router();

router.post("/", createEduvent);

router
    .route("/:id")
    .get(getEduvent)
    .put(updateEduvent)
    .delete(deleteEduvent);

module.exports = router;