import { test, expect } from "@playwright/test";
import playwright from "playwright";
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout } from "./customDefinitions.config";
import { NumeroAtendimento} from "../lib/definitions";
import { TuplaInformacoesParciaisAudienciaFinalizada, TuplaInformacoesParciaisAudienciaCancelada, tratativaAudiencia, TuplaInformacoesNulasAudiencia, TuplaInformacoesFailedAudiencia } from "../scraper-Audiencia";
import { carregarAlteracoesBaseAudiencia, executarBackupBaseAudiencia, NA, retornaReclamacoesDivergentesPeriodo, retornaReclamacoesFalhas,  salvarAlteracoesBaseAudiencia } from '../utils/databaseAudiencia.quickAcessFunctions';
import { createLogger } from './loggers.config';

const logger = createLogger({
  filenameCombine: 'audiencia/audiencia-combine',
  filenamePassed: 'audiencia/audiencia-passed',
  filenameFailed: 'audiencia/audiencia-failed',
  filenameBlank: 'audiencia/audiencia-blank',
});

test("test", async ({ page }) => {
  console.time("Tempo-de-Execução-Total");

  const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch, });

  const context = await customContext(browser);
  const textoBusca = 'Audiência';
  const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
  const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
  const regexDataAudiencia = new RegExp(` Dia \\d{2} de [A-Za-z]+ de \\d{4}`, 'i');
  const regexDataAbertura = new RegExp('\\d{2}\\/\\d{2}\\/\\d{4}', 'i');
  
  const listaBusca = NA;

  executarBackupBaseAudiencia();
  
  process.on('SIGINT', () => salvarAlteracoesBaseAudiencia('SIGINT', allTested));
  process.on('SIGTERM', () => salvarAlteracoesBaseAudiencia('SIGTERM', allTested));

  await page.goto("https://proconsumidor.mj.gov.br/#/inicio", { waitUntil: "networkidle", timeout: customTimeout.general });

  let allTested: any[] = [];
  console.log(listaBusca);
  for (const NA of listaBusca) {
    
    const numeroAtendimento = new NumeroAtendimento(NA);
    
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

      if (conjuntoCorrespondencia.length === 0) {
      
        const argsBlank = Array(7).fill('') as TuplaInformacoesNulasAudiencia;
        const audienciaBlank = new tratativaAudiencia('blank', numeroAtendimento.Formatacao(1), 'Ausência de Tratativa', ...argsBlank);
        const estruturaBlank = audienciaBlank.retornaEstrutura(1);
        allTested.push(estruturaBlank);
        logger.log('blank', `${numeroAtendimento.Formatacao(1)} ⚖️ ⚠️`);
    
      }  else  {
          for (const correspondencia of conjuntoCorrespondencia) {

            await correspondencia.click({ timeout: 90000 });
            await page.waitForSelector('.loader-container', { state: 'hidden' });

            const situacaoAudiencia = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';

            const tabelaAudiencia = await page.locator('app-tratativa table tbody tr:nth-child(n)').all();

            for (const linha of tabelaAudiencia) {
              
              if (situacaoAudiencia.trim() === 'Finalizada') {
                const dataAbertura = (await page.locator('app-reclamacao-cadastro div.col-md-12 div.card-body .row .col-md-3 span').first().textContent() ?? '').match(regexDataAbertura)?.[0] ?? '';
                const dataAudiencia = (await page.locator('app-tratativa-audiencia').first().filter({ hasText: regexDataAudiencia }).textContent() ?? '').match(regexDataAudiencia)?.[0] ?? '';
                const conteudoLinha: string[] = (await linha.locator('> td').allInnerTexts()).slice(0,4);
                const args = conteudoLinha as TuplaInformacoesParciaisAudienciaFinalizada;
                const painelFornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                const fornecedorCodigo = (await painelFornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                const fornecedorCNPJ = await painelFornecedor.locator('input').nth(3).inputValue();
                const resultadoAudiencia = (await page.locator('app-visualizar-audiencia #resultadoAudiencia option:checked').textContent()) ?? '';
              
                
                const audiencia = new tratativaAudiencia( 'passed', numeroAtendimento.Formatacao(1), fornecedorCodigo, dataAbertura, args[0], fornecedorCNPJ, dataAudiencia, situacaoAudiencia, '', resultadoAudiencia);
                const estrutura = audiencia.retornaEstrutura(1);

                allTested.push(estrutura);
                logger.log('passed', `${numeroAtendimento.Formatacao(1)} ⚖️ ✅`);
                
              
              
              }
              if (situacaoAudiencia.trim() === 'Cancelada') {
                const dataAudiencia = (await page.locator('app-tratativa-audiencia').first().filter({ hasText: regexDataAudiencia }).textContent() ?? '').match(regexDataAudiencia)?.[0] ?? '';
                const conteudoLinha: string[] = (await linha.locator('> td').allInnerTexts()).slice(0,1);
                const args = conteudoLinha as TuplaInformacoesParciaisAudienciaCancelada ;
                const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                const fornecedorCodigo = (await fornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
                const scraping = 'passed';
                const dataAbertura = (await page.locator('app-reclamacao-cadastro div.col-md-12 div.card-body .row .col-md-3 span').first().textContent() ?? '').match(regexDataAbertura)?.[0] ?? '';
                const audiencia = new tratativaAudiencia( 'passed', numeroAtendimento.Formatacao(1), fornecedorCodigo, dataAbertura, args[0], fornecedorCNPJ, dataAudiencia, situacaoAudiencia,'', '');
                const estrutura = audiencia.retornaEstrutura(2);
                
                allTested.push(estrutura);
                logger.log('passed', `${numeroAtendimento.Formatacao(1)} ⚖️ ✅`);

              }
            }


          }
      }
      console.log(allTested); 
      carregarAlteracoesBaseAudiencia(allTested);
      allTested.length = 0;
     
      
    } catch (error) {
    
        const argsFailed = Array(8).fill('') as TuplaInformacoesFailedAudiencia;
        const audienciaFailed = new tratativaAudiencia('failed', numeroAtendimento.Formatacao(1), ...argsFailed,);
        const estruturaFailed = audienciaFailed.retornaEstrutura(1);
        allTested.push(estruturaFailed);
        logger.log('failed', `${numeroAtendimento.Formatacao(1)} ⚖️ ❌`);
        
    }
  }
   
  console.timeEnd("Tempo-de-Execução-Total");
  await browser.close();  

});
