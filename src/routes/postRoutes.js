const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

const commentRoutes = require("./commentRoutes");

router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);

router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

router.use('/:postId/comments', commentRoutes);

module.exports = router;
