import express from 'express';
import multer from 'multer';
import path from 'path';
const upload = multer({ dest: 'data/in/', filename: '.xlsx' });
const app = express();
const PORT = 3000;
const buttonUpload = document.getElementById('run-scraping');
const columnNameInput = document.getElementById('column-name');
const sheetTypeSelect = document.getElementById('sheet-type');

//Guarda o arquivo enviado na pasta 'data/in/' com o nome '.xlsx'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define a pasta onde o arquivo será salvo
    cb(null, 'data/in/'); 
  },
  filename: function (req, file, cb) {
    // Mantém a extensão original e define um nome único (timestamp + nome)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });



app.post('/upload', upload.single('upload-file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded successfully: ${req.file.originalname}`);
});
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, './frontend', 'index.html')));


app.get('/', (req, res) => {
   
}); 

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

