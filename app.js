const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tododb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

app.use(express.json());
app.use(express.static('public'));

// Inicializar base de datos
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Base de datos inicializada');
  } catch (err) {
    console.error('❌ Error inicializando BD:', err);
  }
};

// HTML básico para la interfaz
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRUD - Tareas</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 30px;
        }
        h1 { 
          color: #667eea;
          margin-bottom: 30px;
          text-align: center;
          font-size: 2.5em;
        }
        .form-group {
          margin-bottom: 20px;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border 0.3s;
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        textarea { resize: vertical; min-height: 80px; }
        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }
        button:hover { background: #5568d3; }
        #tasksList {
          margin-top: 30px;
        }
        .task {
          background: #f8f9fa;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 10px;
          border-left: 4px solid #667eea;
          transition: transform 0.2s;
        }
        .task:hover { transform: translateX(5px); }
        .task.completed {
          opacity: 0.6;
          border-left-color: #28a745;
        }
        .task h3 {
          color: #333;
          margin-bottom: 10px;
        }
        .task p {
          color: #666;
          margin-bottom: 15px;
        }
        .task-actions {
          display: flex;
          gap: 10px;
        }
        .btn-small {
          padding: 8px 15px;
          font-size: 14px;
        }
        .btn-delete { background: #dc3545; }
        .btn-delete:hover { background: #c82333; }
        .btn-toggle { background: #28a745; }
        .btn-toggle:hover { background: #218838; }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📝 Gestor de Tareas</h1>
        
        <div class="form-group">
          <input type="text" id="title" placeholder="Título de la tarea">
        </div>
        <div class="form-group">
          <textarea id="description" placeholder="Descripción (opcional)"></textarea>
        </div>
        <button onclick="createTask()">➕ Agregar Tarea</button>
        
        <div id="tasksList"></div>
      </div>

      <script>
        async function loadTasks() {
          const res = await fetch('/api/tasks');
          const tasks = await res.json();
          const list = document.getElementById('tasksList');
          
          if (tasks.length === 0) {
            list.innerHTML = '<div class="empty-state">No hay tareas aún. ¡Crea una nueva!</div>';
            return;
          }
          
          list.innerHTML = tasks.map(task => \`
            <div class="task \${task.completed ? 'completed' : ''}">
              <h3>\${task.title}</h3>
              <p>\${task.description || 'Sin descripción'}</p>
              <div class="task-actions">
                <button class="btn-small btn-toggle" onclick="toggleTask(\${task.id})">
                  \${task.completed ? '↩️ Reactivar' : '✅ Completar'}
                </button>
                <button class="btn-small btn-delete" onclick="deleteTask(\${task.id})">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          \`).join('');
        }

        async function createTask() {
          const title = document.getElementById('title').value;
          const description = document.getElementById('description').value;
          
          if (!title) {
            alert('El título es obligatorio');
            return;
          }
          
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
          });
          
          document.getElementById('title').value = '';
          document.getElementById('description').value = '';
          loadTasks();
        }

        async function toggleTask(id) {
          await fetch(\`/api/tasks/\${id}/toggle\`, { method: 'PUT' });
          loadTasks();
        }

        async function deleteTask(id) {
          if (confirm('¿Eliminar esta tarea?')) {
            await fetch(\`/api/tasks/\${id}\`, { method: 'DELETE' });
            loadTasks();
          }
        }

        loadTasks();
      </script>
    </body>
    </html>
  `);
});

// CREATE - Crear tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Obtener una tarea
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Actualizar tarea
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
      [title, description, completed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Toggle completado
app.put('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada', task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  await initDB();
});
