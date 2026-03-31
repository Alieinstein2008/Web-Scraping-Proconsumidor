import { test, expect } from "@playwright/test";
import playwright from "playwright";
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout } from "./customDefinitions.config";
import { NumeroAtendimento, TratativaCarta, TuplaInformacoesNulasCarta } from "../lib/definitions";
import { createLogger } from './loggers.config';
import { TuplaInformacoesParciaisAudiencia, tratativaAudiencia } from "../scraper-Audiencia";
const logger = createLogger({
  filenameCombine: 'audiencia/audiencia-combine',
  filenamePassed: 'audiencia/audiencia-passed',
  filenameFailed: 'audiencia/audiencia-failed',
  filenameBlank: 'audiencia/audiencia-blank',
});

test("test", async ({ page }) => {
  const textoBusca = 'Audiência';
  const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
  const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');

  let allTested: any[] = [];
  let contadorOcorrencia = 0;
  let limiteComparativo = 100;

  console.time("Tempo-de-Execução-Total");

  const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch, });
  const context = await customContext(browser);
  //let page = await context.newPage();

  await page.goto("https://proconsumidor.mj.gov.br/#/inicio", { waitUntil: "networkidle", timeout: customTimeout.general });

  //const itensBusca = "22.12.0532.001.00701-3";
  //for (const NA of itensBusca) {
  const numeroAtendimento = new NumeroAtendimento("22.12.0532.001.00701-3");
  try {
    await page.getByPlaceholder("Nº de Atendimento").fill(numeroAtendimento.Formatacao(1));
    await page.getByTitle("Pesquisar").first().click({ timeout: 30000 });
    await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: customTimeout.general });
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

      const tabelaAudiencia = await page.locator('app-tratativa table tbody tr:nth-child(n)').all();
      for (const linha of tabelaAudiencia) {

        const conteudoLinha: string[] = await linha.locator('> td').allInnerTexts();
        const args = conteudoLinha as TuplaInformacoesParciaisAudiencia;
        const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
        const fornecedorCodigo = (await fornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
        const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
        let dataAudiencia = '';
        if (situacaoAudiencia.trim() === 'Finalizada') {
          dataAudiencia = (await page.locator('app-tratativa h5').first().textContent()) ?? '';
        }
        if (situacaoAudiencia.trim() === 'Cancelada') {
          dataAudiencia = await page.locator('app-detalhar-audiencia span').nth(1).textContent() ?? '';
        }
        const audiencia = new tratativaAudiencia('passed', numeroAtendimento.Formatacao(1), situacaoAudiencia, fornecedorCodigo, fornecedorCNPJ, dataAudiencia,'', ...args);
        console.log(audiencia);
        
       
        /* const estrutura = audiencia.retornaEstrutura(1);
        allTested.push(estrutura);
        logger.log('passed', `${numeroAtendimento.Formatacao(1)} ✉️ ✅`); */


       
        /* console.log(conteudoLinha);
        console.log(fornecedorCodigo);
        console.log(fornecedorCNPJ);
        console.log(dataAudiencia); */
        
      }


       
      


    }
  } catch { }
  //}
});
