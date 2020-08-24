const express = require("express");
const upload = require("../middleware/multer");
const { 
    getEduvent,
    createEduvent,
    updateEduvent,
    deleteEduvent
} = require("../controllers/eduvents");

const Eduvent = require("../models/Eduvent");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/", protect, upload.single("img"), function(req, res, next) { 
    req.body.location = JSON.parse(req.body.location) || undefined;
    next();
}, createEduvent);

router
    .route("/:id")
    .get(protect, getEduvent)
    .put(protect, updateEduvent)
    .delete(protect, deleteEduvent);

module.exports = router;