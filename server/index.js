const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-mude-me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'senha123';

// Middleware de Autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Autenticação
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ user: email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      session: {
        access_token: token,
        user: { email }
      }
    });
  }
  return res.status(401).json({ error: 'Credenciais inválidas' });
});

app.get('/api/auth/session', authenticate, (req, res) => {
  res.json({ session: { user: { email: req.user.user } } });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Helper para CRUD
const createHandlers = (table) => {
  const router = express.Router();
  
  router.get('/', authenticate, async (req, res) => {
    try {
      const orderColumn = table === 'condominios' ? 'nome' : 'criado_em';
      const orderDir = table === 'condominios' ? 'ASC' : 'DESC';
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderColumn} ${orderDir}`);
      res.json({ data: result.rows, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message, data: null });
    }
  });

  router.post('/', authenticate, async (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(query, values);
      res.json({ data: result.rows, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message, data: null });
    }
  });

  router.put('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      
      const setStr = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(id);
      
      const query = `UPDATE ${table} SET ${setStr} WHERE id = $${values.length} RETURNING *`;
      const result = await pool.query(query, values);
      res.json({ data: result.rows, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message, data: null });
    }
  });

  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
      res.json({ data: result.rows, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message, data: null });
    }
  });

  return router;
};

// Rotas CRUD
app.use('/api/condominios', createHandlers('condominios'));
app.use('/api/itens_monitorados', createHandlers('itens_monitorados'));
app.use('/api/servicos', createHandlers('servicos'));

// Tratamento de erros não capturados
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message, data: null });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
