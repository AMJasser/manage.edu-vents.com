const express = require("express");
const {
    getTeam,
    createTeam,
    getUpdate,
    updateTeam,
    deleteTeam
} = require("../controllers/teams");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.post("/", createTeam);

router.get("/:id/edit", getUpdate);

router
    .route("/:id")
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;