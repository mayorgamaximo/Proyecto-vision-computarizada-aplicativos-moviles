const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const io = require('socket.io')
const httpServer = require('http');
const path = require('node:path')

const app = express();
const server = httpServer.createServer(app);
const ioServer = io(server);

ioServer.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('pedido', (data) => {
    console.log('Pedido recibido:', data);
    ioServer.emit('pedido', data);
  });

  socket.on('estadoMesa', (incomingData) => {
    const data = JSON.parse(incomingData)

    const { mesa, estado } = data

    if (!['libre', 'ocupada'].includes(estado)) {
      console.error('Estado inválido:', estado);
      return;
    }

    ioServer.emit('cambioMesa', data);

    db.query(
      'UPDATE mesas SET estado = ? WHERE id = ?',
      [estado, mesa],
      (err) => {
        if (err) return console.error('Error actualizando mesa:', err.message);
        console.log(`Mesa ${mesa} actualizada a ${estado}`);
        ioServer.emit('estadoMesa', data);
      }
    );
  });

});

app.set('views', path.join(__dirname, 'vistas'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aplicativos_moviles',
  port: 3306
})

// Crear tabla mesas si no existe
db.query(`
  CREATE TABLE IF NOT EXISTS mesas (
    id INT PRIMARY KEY,
    estado VARCHAR(10) CHECK (estado IN ('libre', 'ocupada'))
  )
`, (err) => {
  if (err) console.error('Error creando tabla mesas:', err.message);
});

// Insertar mesas iniciales si no existen
[1, 2].forEach(id => {
  db.query('INSERT IGNORE INTO mesas (id, estado) VALUES (?, ?)', [id, 'libre']);
});

// Renderizar vista principal
app.get('/', (req, res) => {
  db.query('SELECT * FROM mesas', (errMesas, mesas) => {
    if (errMesas) return res.status(500).json({ error: errMesas.message });

    // Cambiar la consulta para obtener datos de la tabla 'platos'
    db.query('SELECT * FROM platos', (errPlatos, platos) => {
      if (errPlatos) return res.status(500).json({ error: errPlatos.message });
      
      // Pasar la lista de platos directamente
      res.render('index', { mesas, platos });
    });
  });
});

// Endpoint para recibir estado de mesa
app.post('/api/estado', (req, res) => {
  const { mesa, estado } = req.body;
  if (!['libre', 'ocupada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  db.query(
    'UPDATE mesas SET estado = ? WHERE id = ?',
    [estado, mesa],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Endpoint para consultar estado de mesas
app.get('/api/estado', (req, res) => {
  db.query('SELECT * FROM mesas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoints anteriores (pedidos) se mantienen
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

app.get('/api/pedidos', (req, res) => {
  db.query('SELECT * FROM pedidos WHERE estado = false ORDER BY hora DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

server.listen(3001, () => console.log('API escuchando en http://localhost:3001'));