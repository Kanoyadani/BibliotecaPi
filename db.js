const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123siltec321', // Senha definida no comando 'docker run'
  port: 5432,
});

// Teste de conexão
pool.query('SELECT 1')
  .then(() => console.log('Conectado ao PostgreSQL com Docker ✅'))
  .catch(err => console.error('Erro ao conectar ❌', err));

module.exports = pool;