document.getElementById('run-scraping').addEventListener('click', async () => {
  const fileInput = document.getElementById('file-input');
  const tipo = document.getElementById('sheet-type').value;
  const file = fileInput.files[0];
  if (!file) {
    alert('Escolha a planilha base.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);

  try {
    const resp = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    if (data.success) {
      document.getElementById('download-result').innerHTML = `
        <p>Arquivo enviado com sucesso! Tipo: ${data.tipo}</p>
        <p>Próximo: integrar com scraper para gerar planilha completa.</p>
      `;
    } else {
      document.getElementById('download-result').innerHTML = `<p>Erro: ${data.error}</p>`;
    }
  } catch (error) {
    document.getElementById('download-result').innerHTML = `<p>Erro na requisição: ${error.message}</p>`;
  }
});