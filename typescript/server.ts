import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

// Configuração do Multer para salvar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.body.tipo; // 'audiencia', 'carta', 'consumidor'
    const folder = path.join(__dirname, '..', 'data', 'in', tipo);
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const tipo = req.body.tipo;
    const nome = `${tipo}-base.xlsx`;
    cb(null, nome);
  }
});

const upload = multer({ storage });

// Rota para upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado.' });
  }

  const tipo = req.body.tipo;
  res.json({
    success: true,
    tipo,
    filename: req.file.filename,
    path: req.file.path
  });
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});