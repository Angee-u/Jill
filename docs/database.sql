-- JILL-11.BAR - Para criar o banco
CREATE DATABASE IF NOT EXISTS jillbar_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jillbar_db;

-- USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(250) NOT NULL,
  bio           TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE,
  slug  VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO categories (name, slug) VALUES
  ('Dia a Dia',     'dia-a-dia'),
  ('Tecnologia',    'tecnologia'),
  ('Off-Topic',     'off-topic'),
  ('Arte e Música', 'arte')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- POSTS
CREATE TABLE IF NOT EXISTS posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(250) NOT NULL,
  content       TEXT         NOT NULL,
  excerpt       VARCHAR(500),
  category_id   INT,
  user_id       INT          NOT NULL,
  spotify_url   VARCHAR(250),
  spotify_track VARCHAR(255),
  status        ENUM('published', 'draft') DEFAULT 'draft',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE SET NULL
);

-- COMENTÁRIOS
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  content    TEXT NOT NULL,
  post_id    INT  NOT NULL,
  user_id    INT  NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
