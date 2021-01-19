const express = require("express");
const {
    getTeam,
    createTeam,
    getUpdate,
    updateTeam,
    deleteTeam
} = require("../controllers/teams");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/", protect, createTeam);

router.get("/:id/edit", protect, getUpdate);

router
    .route("/:id")
    .get(protect, getTeam)
    .put(protect, updateTeam)
    .delete(protect, deleteTeam);

module.exports = router;