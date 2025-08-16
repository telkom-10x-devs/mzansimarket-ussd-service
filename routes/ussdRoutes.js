const express = require("express");

const { test, handleUSSD } = require("../controllers/ussdController");
const router = express.Router();

// Test route
// router.get("/test", test);

// Main USSD route
router.post("/", handleUSSD);

module.exports = router;
