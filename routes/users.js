const express = require("express");
const {
    createUser,
    getUpdate,
    updateUser,
    deleteUser
} = require("../controllers/users");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.post("/", createUser);

router.get("/:id/edit", getUpdate);

router
    .route("/:id")
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;