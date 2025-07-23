const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // <--- REEMPLAZA POR TU USUARIO DE MYSQL
  password: '', // <--- REEMPLAZA POR TU PASSWORD
  database: 'aplicativos_moviles',
  port: 3306
});

app.post('/api/pedidos', (req, res) => {
  const { mesa, pedido, nota, hora } = req.body;
  db.query(
    'INSERT INTO pedidos (mesa, pedido, nota, hora, estado) VALUES (?, ?, ?, ?, ?)',
    [mesa, pedido, nota, hora, false],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Endpoint para actualizar el estado de un pedido
app.put('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  db.query(
    'UPDATE pedidos SET estado = ? WHERE id = ?',
    [estado, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Nuevo endpoint para obtener pedidos
app.get('/api/pedidos', (req, res) => {
  db.query('SELECT * FROM pedidos WHERE estado = false ORDER BY hora DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(3001, () => console.log('API escuchando en puerto 3001'));
