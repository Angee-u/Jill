const pool = require("../config/db");

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res
        .status(400)
        .json({ error: "O comentário não pode estar vazio." });
    }

    const [post] = await pool.query(
      "SELECT id FROM posts WHERE id = ? AND status = 'published'",
      [postId],
    );

    if (post.length === 0) {
      return res.status(404).json({ error: "Post não encontrado." });
    }

    const [result] = await pool.query(
      "INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)",
      [content, postId, user_id],
    );

    return res.status(201).json({
      message: "Comentário adicionado!",
      commentId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar comentário." });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Verifica se o post existe
    const [post] = await pool.query("SELECT id FROM posts WHERE id = ?", [
      postId,
    ]);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post não encontrado." });
    }

    // Busca os comentários com o nome do autor via JOINzinho
    const [comments] = await pool.query(
      `SELECT
        comments.id,
        comments.content,
        comments.created_at,
        users.id       AS user_id,
        users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = ?
       ORDER BY comments.created_at ASC`,
      [postId],
    );

    return res.json({ comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar comentários." });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res
        .status(400)
        .json({ error: "O comentário não pode estar vazio." });
    }

    // Só o dono do comentário pode editar sa bomba
    const [rows] = await pool.query(
      "SELECT id FROM comments WHERE id = ? AND user_id = ?",
      [id, user_id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Comentário não encontrado ou sem permissão." });
    }

    await pool.query("UPDATE comments SET content = ? WHERE id = ?", [
      content,
      id,
    ]);

    return res.json({ message: "Comentário atualizado!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar comentário." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [rows] = await pool.query(
      `SELECT comments.id
       FROM comments
       JOIN posts ON comments.post_id = posts.id
       WHERE comments.id = ?
         AND (comments.user_id = ? OR posts.user_id = ?)`,
      [id, user_id, user_id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Comentário não encontrado ou sem permissão." });
    }

    await pool.query("DELETE FROM comments WHERE id = ?", [id]);

    return res.json({ message: "Comentário deletado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar comentário." });
  }
};
