const express = require("express");
const upload = require("../middleware/multer");
const dataValid = require("../middleware/dataValid");
const { 
    getEduvent,
    createEduvent,
    getUpdate,
    updateEduvent,
    deleteEduvent
} = require("../controllers/eduvents");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/", protect, upload.single("img"), dataValid, createEduvent);

router.get("/:id/edit", protect, getUpdate);

router
    .route("/:id")
    .get(protect, getEduvent)
    .put(protect, upload.single("img"), dataValid, updateEduvent)
    .delete(protect, deleteEduvent);

module.exports = router;