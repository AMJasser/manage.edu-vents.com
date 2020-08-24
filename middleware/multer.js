const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now() + path.extname(file.originalname));
    }
});

module.exports = multer({ storage: storage });