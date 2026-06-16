const pool = require("../config/db");

exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category_id,
      spotify_url,
      spotify_track,
      status,
    } = req.body;
    const user_id = req.user.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Título e conteúdo são obrigatórios." });
    }

    const finalExcerpt =
      excerpt ||
      (content.length > 120 ? content.slice(0, 117) + "..." : content);

    const finalCategoryId =
      !category_id || category_id === "null" || category_id === ""
        ? null
        : category_id;

    const [result] = await pool.query(
      `INSERT INTO posts (title, content, excerpt, category_id, user_id, spotify_url, spotify_track, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        finalExcerpt,
        finalCategoryId,
        user_id,
        spotify_url || null,
        spotify_track || null,
        status || "published",
      ],
    );

    return res.status(201).json({
      message: "Post criado com sucesso!",
      postId: result.insertId,
    });
  } catch (err) {
    console.error("Erro no createPost:", err);
    return res.status(500).json({ error: "Erro interno ao criar post." });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Trazemos as colunas da categoria slugs
    let query = `
      SELECT
        posts.id,
        posts.title,
        posts.excerpt,
        posts.spotify_url,
        posts.spotify_track,
        posts.status,
        posts.created_at,
        users.username,
        users.id AS user_id,
        categories.name AS category_name,
        categories.slug AS category_slug
      FROM posts
      JOIN users           ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.status = 'published'
    `;

    const params = [];

    // Slug, testando a porcaria do erro das categorias
    if (category) {
      query += " AND categories.slug = ?";
      params.push(category);
    }

    query += " ORDER BY posts.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [posts] = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.status = 'published'
    `;
    const countParams = [];

    if (category) {
      countQuery += " AND categories.slug = ?";
      countParams.push(category);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    return res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Erro no getAllPosts:", err);
    return res.status(500).json({ error: "Erro ao buscar posts do servidor." });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT
        posts.id,
        posts.title,
        posts.excerpt,
        posts.content,
        posts.spotify_url,
        posts.spotify_track,
        posts.status,
        posts.created_at,
        posts.category_id,
        categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.user_id = ?
    `;
    const params = [user_id];

    if (status) {
      query += " AND posts.status = ?";
      params.push(status);
    }

    query += " ORDER BY posts.created_at DESC";

    const [posts] = await pool.query(query, params);

    return res.json({ posts });
  } catch (err) {
    console.error("Erro no getMyPosts:", err);
    return res.status(500).json({ error: "Erro ao buscar seus posts." });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        posts.*,
        users.username,
        categories.name AS category_name,
        categories.slug AS category_slug
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN categories ON posts.category_id = categories.id
       WHERE posts.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post não encontrado no sistema." });
    }

    const post = rows[0];

    if (post.status !== "published") {
      if (!req.user || req.user.id !== post.user_id) {
        return res
          .status(404)
          .json({ error: "Post não encontrado no sistema." });
      }
    }

    return res.json(post);
  } catch (err) {
    console.error("Erro no getPostById:", err);
    return res
      .status(500)
      .json({ error: "Erro ao buscar o post requisitado." });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category_id, spotify_url, spotify_track, status } =
      req.body;
    const user_id = req.user.id;

    // Garante que category_id seja null se estiver vazio ou string vazia
    const finalCategoryId =
      !category_id || category_id === "null" || category_id === ""
        ? null
        : category_id;

    // Verifica se o post pertence ao usuário
    const [rows] = await pool.query(
      "SELECT id FROM posts WHERE id = ? AND user_id = ?",
      [id, user_id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ error: "Post não encontrado ou sem permissão." });

    const { excerpt } = req.body;

    let finalExcerpt =
      excerpt ||
      (content.length > 120 ? content.slice(0, 117) + "..." : content);

    await pool.query(
      `UPDATE posts 
       SET title = ?, content = ?, excerpt = ?, category_id = ?, spotify_url = ?, spotify_track = ?, status = ? 
       WHERE id = ?`,
      [
        title,
        content,
        finalExcerpt,
        finalCategoryId,
        spotify_url || null,
        spotify_track || null,
        status || "published",
        id,
      ],
    );

    return res.json({ message: "Post atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro no updatePost:", err);
    return res.status(500).json({ error: "Erro de servidor ao atualizar." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verifica dono
    const [rows] = await pool.query(
      "SELECT id FROM posts WHERE id = ? AND user_id = ?",
      [id, user_id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Post não encontrado ou privilégios insuficientes." });
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);

    return res.json({
      message: "Post deletado permanentemente do arquivo central.",
    });
  } catch (err) {
    console.error("Erro no deletePost:", err);
    return res.status(500).json({ error: "Erro ao deletar post do sistema." });
  }
};
