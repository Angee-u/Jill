const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");

const commentRoutes = require("./commentRoutes");

router.get("/", postController.getAllPosts);
router.get("/mine", authMiddleware, postController.getMyPosts);
router.get("/:id", optionalAuthMiddleware, postController.getPostById);

router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

router.use('/:postId/comments', commentRoutes);

module.exports = router;
