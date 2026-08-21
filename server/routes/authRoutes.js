const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working successfully 🚀",
  });
});

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

module.exports = router;