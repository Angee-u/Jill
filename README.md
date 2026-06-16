# JILL-11.BAR

Blog inspirado no universo de **VA-11 Hall-A**
---

## Objetivo

Criar uma plataforma de blog pessoal e coletivo onde usuários podem publicar textos sobre o dia a dia, tecnologia, arte e outros assuntos, com visual temático de um bar em Glitch City. O projeto foi desenvolvido como trabalho acadêmico de **Web I**, utilizando tecnologias web.

---

## Funcionalidades

### Públicas (sem login)
- **Feed de posts** — listagem cronológica com filtros por categoria e paginação
- **Leitura de posts** — visualização completa com player do Spotify embutido (quando houver trilha)
- **Comentários** — leitura em posts publicados
- **Páginas institucionais** — Sobre e Contato

### Autenticação
- Cadastro de usuário (username, e-mail, senha)
- Login com JWT (token válido por 3 dias)
- Sessão persistida no `localStorage` do navegador

### Área do autor (com login)
- **Criar post** (`criar-post.html`) — formulário temático para publicar logs com título, resumo, categoria, conteúdo e música do Spotify
- **Painel de gestão** (`listagem.html`) — tabela dos próprios posts com criar, editar, deletar e filtro por status (publicado/rascunho)
- **Editar e deletar** — pelo painel ou pela página individual do post
- **Comentar** — em posts de outros usuários; editar e deletar os próprios comentários

### Integrações
- **Spotify Web API** — busca de faixas para vincular aos posts
- **MySQL** — persistência de usuários, posts, categorias e comentários

---

## Stack tecnológica

Frontend - HTML5, CSS3, JavaScript
Backend - Node.js, Express 
Banco de dados - MySQL 
Autenticação - JWT + bcrypt 
API externa - Spotify Web API 

---

## Estrutura do banco de dados

> O SCRIPT SE ENCONTRA NOS DOCS: [`docs/database.sql`](docs/database.sql).

---

# Resumo da API REST — JILL-11.BAR

Abaixo estão os endpoints organizados para referência do projeto. Rotas marcadas como **JWT** exigem autenticação.

## Autenticação
- `POST /api/auth/register` — Cadastro de novo usuário.
- `POST /api/auth/login` — Autenticação de usuário e obtenção de token.

## Posts
- `GET /api/posts` — Feed público (paginado).
- `GET /api/posts/mine` — (**JWT**) Listar posts do usuário autenticado.
- `GET /api/posts/:id` — (Opcional) Detalhes de um post por ID.
- `POST /api/posts` — (**JWT**) Criar um novo post.
- `PUT /api/posts/:id` — (**JWT**) Editar um post existente.
- `DELETE /api/posts/:id` — (**JWT**) Deletar um post.

## Comentários
- `GET /api/posts/:id/comments` — Listar comentários de um post.
- `POST /api/posts/:id/comments` — (**JWT**) Adicionar um comentário a um post.
- `PUT /api/posts/:id/comments/:id` — (**JWT**) Editar um comentário próprio.
- `DELETE /api/posts/:id/comments/:id` — (**JWT**) Remover um comentário.

## Spotify
- `GET /api/spotify/search?q=` — (**JWT**) Buscar músicas no Spotify.

---

## Guia de instalação

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- Conta no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) (para busca de músicas)

### 1. Clonar o repositório

```bash
git clone https://github.com/Angee-u/Jill.git
cd Jill
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o banco de dados

Abra o MySQL Workbench (ou terminal) e execute o script:

```bash
# Via terminal MySQL:
mysql -u root -p < docs/database.sql
```

Ou copie e cole o conteúdo de `docs/database.sql` no Workbench.

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):

```bash
cp .env.example .env
```

Edite o `.env` com seus dados:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=jillbar_db
DB_PORT=3306

JWT_SECRET=uma_chave_secreta_longa_e_aleatoria

SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
```

> O arquivo `.env` **não é versionado** no Git por segurança.

### 5. Iniciar o servidor

**Desenvolvimento** (reinicia ao salvar arquivos):

```bash
npm run dev
```

### 6. Acessar o site

Abra no navegador:

```
http://localhost:3000
```

---

## Fluxo das páginas

| Página | Caminho | Acesso |
|--------|---------|--------|
| Home / Feed | `/` ou `/home.html` | Público |
| Login / Cadastro | `/login.html` | Público |
| Criar post | `/criar-post.html` | Logado |
| Meus posts | `/listagem.html` | Logado (clique no nome no header) |
| Ver post | `/post.html?id=1` | Público |
| Sobre | `/sobre.html` | Público |
| Contato | `/contato.html` | Público |

---

## Author

**Angee**
