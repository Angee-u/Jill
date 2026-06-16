const express = require("express");
const router = express.Router();
const spotifyController = require("../controllers/spotifyController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/search", authMiddleware, spotifyController.searchTrack);

module.exports = router;
