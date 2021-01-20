const express = require("express");
const upload = require("../middleware/multer");
const {
    create,
    edit
} = require("../middleware/imgHandler");
const { 
    createInitiative,
    getUpdate,
    updateInitiative
} = require("../controllers/initiatives");

const router = express.Router();

const { protect } = require("../middleware/auth");

const Initiative = require("../models/Initiative");

router.post("/", protect, upload.single("img"), create, createInitiative);

router.get("/:id/edit", protect, getUpdate);

router
    .route("/:id")
    .put(protect, upload.single("img"), edit(Initiative), updateInitiative);
    //.delete(protect, deleteEduvent);

module.exports = router;