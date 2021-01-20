const express = require("express");
const upload = require("../middleware/multer");
const {
    create,
    edit
} = require("../middleware/imgHandler");
const dataValid = require("../middleware/dataValid");
const { 
    getEduvent,
    createEduvent,
    getUpdate,
    updateEduvent,
    deleteEduvent
} = require("../controllers/edu-vents");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/", protect, upload.single("img"), create, dataValid, createEduvent);

router.get("/:id/edit", protect, getUpdate);

router
    .route("/:id")
    .get(protect, getEduvent)
    .put(protect, upload.single("img"), edit, dataValid, updateEduvent)
    .delete(protect, deleteEduvent);

module.exports = router;