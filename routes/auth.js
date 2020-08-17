const express = require("express");
const {
    getLogin,
    login,
    logout,
    updatePassword
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router
    .route("/login")
    .get(getLogin)
    .post(login);
router.get("/logout", logout);
router.put("/updatepassword", protect, updatePassword);