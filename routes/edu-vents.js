const express = require("express");
const upload = require("../middleware/multer");
const {
    create,
    edit
} = require("../middleware/imgHandler");
const { 
    getEduvent,
    createEduvent,
    getUpdate,
    updateEduvent,
    deleteEduvent
} = require("../controllers/edu-vents");

const router = express.Router();

const { protect } = require("../middleware/auth");

const Eduvent = require("../models/Eduvent");

router.post("/", protect, upload.single("img"), create, createEduvent);

router.get("/:id/edit", protect, getUpdate);

router
    .route("/:id")
    .get(protect, getEduvent)
    .put(protect, upload.single("img"), edit(Eduvent), updateEduvent)
    .delete(protect, deleteEduvent);

module.exports = router;