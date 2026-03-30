import { test, expect } from "@playwright/test";
import playwright from "playwright";
import {customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout} from "./customDefinitions.config";
import { NumeroAtendimento, TratativaCarta, TuplaInformacoesNulasCarta } from "../lib/definitions";
import { createLogger } from './loggers.config';

const logger = createLogger({
   filenameCombine: 'audiencia/audiencia-combine',
    filenamePassed: 'audiencia/audiencia-passed',
    filenameFailed: 'audiencia/audiencia-failed',
    filenameBlank: 'audiencia/audiencia-blank',
});

test("test", async ({ page }) => {
  console.time("Tempo-de-Execução-Total");

  const browser = await playwright.chromium.launch({args: customOptimizationBrowserArgsLaunch,});

  const context = await customContext(browser);
  const textoBusca = 'Audiência';
  const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
  const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
  await page.goto("https://proconsumidor.mj.gov.br/#/inicio", {waitUntil: "networkidle", timeout: customTimeout.general});

  //const itensBusca = "22.12.0532.001.00701-3";
  //for (const NA of itensBusca) {
    const numeroAtendimento = new NumeroAtendimento("22.12.0532.001.00701-3");
    try {
      await page.getByPlaceholder("Nº de Atendimento").fill(numeroAtendimento.Formatacao(1));
      await page.getByTitle("Pesquisar").first().click({ timeout: 30000 });
      await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`,{ timeout: customTimeout.general});
      await page.waitForSelector(".loader-container", { state: "hidden" });
      const painelTratativa = page.locator('app-tratativa');

      if (!await painelTratativa.isVisible()) {
        await page.getByTitle('Clique para Expandir/Recolher').filter({ hasText: "Tratativas" }).click();
      };

      const conjuntoCorrespondencia = await page.getByText(regexBusca).all();
      
      for (const correspondencia of conjuntoCorrespondencia) {
      
        await correspondencia.click({ timeout: 90000 });
        await page.waitForSelector('.loader-container', { state: 'hidden' });
        
        const situacaoAudiencia = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';
       
        if(situacaoAudiencia.trim() === 'Finalizada') {
          const data = (await page.locator('app-tratativa h5').first().textContent()) ?? '';
          const rows = page.locator('app-tabela-audiencia-fornecedor tbody tr');
          const fornecedorList = [];
          const respostaList = [];
          const rowElements = await rows.all();
          for (const row of rowElements) {
            const firstTd = (await row.locator('td').first().textContent()) ?? '';
            fornecedorList.push(firstTd.trim());
            const fourthTd = (await row.locator('td').nth(3).textContent()) ?? '';
            respostaList.push(fourthTd.trim());
          }
          const fornecedor = fornecedorList.join('; ');
          const respostaFornecedor = respostaList.join('; ');
          const resultadoAudiencia = (await page.locator('app-visualizar-audiencia #resultadoAudiencia option:checked').textContent()) ?? '';
          const scraping = 'passed';
          
          console.log(`Número de Atendimento: ${numeroAtendimento.Formatacao(1)}`);
          console.log(data.trim());
          console.log(situacaoAudiencia.trim());
          console.log(fornecedor.trim());
          console.log(respostaFornecedor.trim());
          console.log(resultadoAudiencia.trim());
          console.log(scraping);
        }
        if(situacaoAudiencia.trim() === 'Cancelada') {
          const data =  await page.locator('app-detalhar-audiencia span').nth(1).textContent() ?? '';
          const fornecedor = await page.locator('app-detalhar-audiencia span').nth(3).textContent() ?? '';
          console.log(`Número de Atendimento: ${numeroAtendimento.Formatacao(1)}`);
          console.log(data.trim());
          console.log(situacaoAudiencia.trim());

        }
       

        
      }
    } catch {}
  //}
});
