const express = require("express");
const router = express.Router({ mergeParams: true }); // Só assim para acessar os comentários
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", commentController.getCommentsByPost);
router.post("/", authMiddleware, commentController.createComment);
router.put("/:id", authMiddleware, commentController.updateComment);
router.delete("/:id", authMiddleware, commentController.deleteComment);

module.exports = router;
