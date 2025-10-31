const express = require("express");
const router = express.Router();
const { authRequired } = require("../middleware/auth");
const { generateMyQr, scanQR } = require("../controllers/qrController");

router.get("/generate", authRequired, generateMyQr);
router.post("/scan", scanQR);

module.exports = router;
