const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Cadastro - AUTHENTICATION
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Campos faltando, preencha tudo." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Mínimo de 6 caracteres." });
    }

    // Verificar se já não foi registrado antes
    const [exist] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (exist.length > 0) {
      return res.status(409).json({ error: "Email ou username já cadastrado" });
    }

    // Usando o Bcrypt - Criptografia
    const password_hash = await bcrypt.hash(password, 10);

    // Inserindo no banco
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, password_hash],
    );

    return res.status(201).json({
      message: "Conta registrada com sucesso!",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Deu erro essa bomba." });
  }
};

// Login - AUTHENTICATION

exports.login = async (req, res) => {
  try {
    const {username, password} = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if(rows.length === 0) {
      return res.status(401).json({error: 'Dados inválidos.'});
    }

    const user = rows[0];

    // Checando a senha para averiguar se são iguais
    const senhaCorreta = await bcrypt.compare(password, user.password_hash);

    if(!senhaCorreta) {
      return res.status(401).json({error: 'Senha inválida.'});
    }

    // Gerando o JWT (rever aaa)
    const token = jwt.sign(
      {id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '3d'}
    );

    return res.json({
      message: 'Login realizado!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Erro no login.'});
  }
};