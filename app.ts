import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { scraperAudiencia } from "./scraper-Audiencia";
import { scraperTratativaCarta } from "./scraper-TratativaCarta";
import { scraperConsumidor } from "./scraper-Consumidor";
import { authenticate } from "./config/auth.function";
import { BaseDados } from './lib/definitions';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = file.tipo || 'temp';
    const folder = path.join(__dirname, 'data', 'in', tipo);
  
    if (!fs.existsSync(folder)) {
       fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
   
},
  filename: (req, file, cb) => {
    cb(null, "Audiencias-Base-Bi-Comparativa.xlsx");
  }
});

const upload = multer({ storage: storage });

// Rota GET para servir HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './views', 'index.html'));
});

// Rota POST para upload e processamento
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    
    if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return res.status(400).json({
        success: false,
        error: 'Tipo de arquivo inválido. Apenas arquivos .xlsx são permitidos.'
      });
    }
    console.log(req.file.mimetype);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado.'
      });
    }

    const tipo = req.body.tipo;
    const columnName = req.body.columnName;
    const htmlContent = req.body.html;
    // Validações
    if (!tipo) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de arquivo não especificado.'
      });
    }

    if (!columnName) {
      return res.status(400).json({
        success: false,
        error: 'Nome da coluna não especificado.'
      });
    }

    // Log detalhado no servidor
    console.log('\n' + '='.repeat(60));
    console.log('📨 DADOS RECEBIDOS DO FRONTEND');
    console.log('='.repeat(60));
    console.log(`✓ Tipo do Arquivo: ${tipo}`);
    console.log(`✓ Nome da Coluna: ${columnName}`);
    console.log(`✓ Arquivo: ${req.file.filename}`);
    console.log(`✓ Tamanho do Arquivo: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`✓ Caminho: ${req.file.path}`);
    console.log(`✓ HTML Recebido: ${htmlContent ? '✓ Sim (' + (htmlContent.length / 1024).toFixed(2) + ' KB)' : '✗ Não'}`);
    console.log('='.repeat(60) + '\n');

    // Processar os dados
    const arquivo = req.file;
    const caminhoArquivoScraper = path.join(__dirname, 'data', 'in', `${tipo}`);
    fs.mkdirSync(caminhoArquivoScraper, { recursive: true });

    const novoCaminho = path.join(caminhoArquivoScraper, `${tipo}s-Comparativa.xlsx`);
    console.log(`📂 Movendo arquivo para: ${novoCaminho}`);
    // Move o arquivo e aguarda a conclusão antes de iniciar o scraper
    await fs.promises.rename(arquivo.path, novoCaminho);
    console.log('Arquivo movido com sucesso para o caminho do scraper.');

    const outputFolder = path.join(__dirname, 'data', 'out', tipo);
    fs.mkdirSync(outputFolder, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(outputFolder, `resultado-${timestamp}.json`);

    if (req.file) {
      try {
        await authenticate();
        console.log("Autenticação concluída, iniciando o scraper...");
        if(tipo === 'Audiencia') {
          console.log('Coluna homologada atualizada para o scraper de audiência:', columnName);
          await scraperAudiencia(columnName);
        }
        if(tipo === 'Carta') {
          console.log('Coluna homologada atualizada para o scraper de carta:', columnName);
          await scraperTratativaCarta(columnName);
        }
        if(tipo === 'Consumidor') {
          console.log('Coluna homologada atualizada para o scraper de consumidor:', columnName);
          await scraperConsumidor(columnName);
        }
      } catch (error) {
        console.error("Erro durante a autenticação ou execução do scraper:", error);
      }
    }

    console.log('✓ Arquivo processado e salvo com sucesso!');

    res.json({
      success: true,
      message: 'Arquivo processado com sucesso!',
      data: {
        tipo,
        columnName,
        arquivo: req.file.filename,
        tamanhoKB: (req.file.size / 1024).toFixed(2),
        status: 'Processado'
      }
    });

  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar arquivo: ' + (error instanceof Error ? error.message : 'Desconhecido')
    });
  }
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Pasta de entrada: ./data/in/`);
  console.log(`📤 Pasta de saída: ./data/out/`);
  console.log('='.repeat(60) + '\n');
});