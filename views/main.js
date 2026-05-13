// ============================================
// STATUS VISUAL E FEEDBACK
// ============================================

const statusDiv = document.createElement('div');
statusDiv.id = 'status-message';
statusDiv.style.cssText = `
  display: none;
  padding: 15px 20px;
  margin: 20px auto;
  max-width: 600px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  animation: slideDown 0.3s ease-in-out;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const spinner = document.createElement('div');
spinner.id = 'loading-spinner';
spinner.style.cssText = `
  display: none;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #7a004b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
`;

const infoBox = document.createElement('div');
infoBox.id = 'info-box';
infoBox.style.cssText = `
  display: none;
  background: #f0f8ff;
  border-left: 4px solid #7a004b;
  padding: 15px;
  margin: 20px auto;
  max-width: 600px;
  border-radius: 4px;
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
`;

document.querySelector('main').appendChild(statusDiv);
document.querySelector('main').appendChild(spinner);
document.querySelector('main').appendChild(infoBox);

// CSS Animações
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  #status-message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  #status-message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  #status-message.info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
  
  #status-message.warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
  
  #run-scraping:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .data-info {
    font-size: 12px;
    margin-top: 10px;
    padding: 10px;
    background: white;
    border-radius: 4px;
  }
  
  .data-info strong {
    color: #7a004b;
  }
`;
document.head.appendChild(style);

// ============================================
// FUNÇÕES DE STATUS
// ============================================

function showStatus(message, type = 'info', duration = null) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  if (duration) {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, duration);
  }
}

function showLoading(show = true) {
  spinner.style.display = show ? 'block' : 'none';
}

function showInfoBox(content, show = true) {
  infoBox.textContent = content;
  infoBox.style.display = show ? 'block' : 'none';
}

function hideStatus() {
  statusDiv.style.display = 'none';
  spinner.style.display = 'none';
  infoBox.style.display = 'none';
}

// ============================================
// ELEMENTOS DO FORMULÁRIO
// ============================================

const fileInput = document.getElementById('file-input');
const columnNameInput = document.getElementById('column-name');
const sheetTypeSelect = document.getElementById('sheet-type');
const runScrapingBtn = document.getElementById('run-scraping');
const dropZone = document.getElementById('drop-zone');
const downloadResult = document.getElementById('download-result');

// ============================================
// EVENTOS DO ARQUIVO
// ============================================

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    showStatus(`✓ Arquivo selecionado: ${file.name} (${sizeMB} MB)`, 'success', 4000);
  }
});

// Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.style.backgroundColor = '#f0f0f0';
    dropZone.style.borderColor = '#7a004b';
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.style.backgroundColor = 'transparent';
    dropZone.style.borderColor = 'inherit';
  }, false);
});

dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  fileInput.files = files;
  if (files.length > 0) {
    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    showStatus(`✓ Arquivo solto: ${file.name} (${sizeMB} MB)`, 'success', 4000);
  }
}, false);

// ============================================
// VALIDAÇÕES EM TEMPO REAL
// ============================================

columnNameInput.addEventListener('input', () => {
  if (columnNameInput.value.trim()) {
    columnNameInput.style.borderColor = '#28a745';
  } else {
    columnNameInput.style.borderColor = 'inherit';
  }
});

// ============================================
// BOTÃO PROCESSAR
// ============================================

runScrapingBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  hideStatus();

  // Validação
  if (!fileInput.files.length) {
    showStatus('❌ Selecione um arquivo XLSX', 'error', 3000);
    return;
  }

  if (!columnNameInput.value.trim()) {
    showStatus('❌ Digite o nome da coluna', 'error', 3000);
    return;
  }

  const file = fileInput.files[0];
  const tipo = sheetTypeSelect.value;
  const columnName = columnNameInput.value.trim();
  const htmlContent = document.documentElement.outerHTML;

  // Mostrar dados sendo enviados
  const dataInfo = `
📋 DADOS SENDO ENVIADOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Tipo: ${tipo.toUpperCase()}
✓ Coluna: ${columnName}
✓ Arquivo: ${file.name}
✓ Tamanho: ${(file.size / 1024).toFixed(2)} KB
✓ HTML: ${(htmlContent.length / 1024).toFixed(2)} KB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
  showInfoBox(dataInfo);

  // Desabilitar botão e mostrar carregamento
  runScrapingBtn.disabled = true;
  showLoading(true);
  showStatus('📤 Enviando dados para o servidor...', 'info');

  try {
    // Criar FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    formData.append('columnName', columnName);
    formData.append('html', htmlContent);

    // Enviar para o servidor
    showStatus('⏳ Aguarde, processando...', 'warning');
    
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao processar');
    }

    // Sucesso
    showLoading(false);
    showStatus('✅ Processado com sucesso!', 'success');
    
    const successInfo = `
✓ PROCESSAMENTO CONCLUÍDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Tipo: ${data.data.tipo.toUpperCase()}
✓ Coluna: ${data.data.columnName}
✓ Status: ${data.data.status}
✓ Tamanho: ${data.data.tamanhoKB} KB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.message}
    `;
    showInfoBox(successInfo);

    // Limpar formulário
    setTimeout(() => {
      fileInput.value = '';
      columnNameInput.value = '';
      runScrapingBtn.disabled = false;
      showStatus('✓ Pronto para novo arquivo', 'success', 3000);
    }, 2000);

  } catch (error) {
    showLoading(false);
    runScrapingBtn.disabled = false;
    showStatus(`❌ Erro: ${error.message}`, 'error', 5000);
    console.error('Erro:', error);
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

window.addEventListener('load', () => {
  console.log('✓ Sistema pronto!');
  console.log('📊 Aguardando arquivo...');
  showStatus('✓ Sistema pronto! Arraste um arquivo ou clique para selecionar.', 'success', 4000);
});

