import playwright from 'playwright';
import { NumeroAtendimento, TratativaAudiencia } from "./lib/definitions";
import { TuplaInformacoesFailedAudiencia, TuplaInformacoesNulasAudiencia, TuplaInformacoesParciaisAudienciaCancelada, TuplaInformacoesParciaisAudienciaFinalizada } from "./types/audiencia.types";
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout } from "./config/customDefinitions.config";
import { createLogger } from './config/loggers.config';
import dbAudienciaQuick from './utils/databaseAudiencia.quickAcessFunctions';

const logger = createLogger({
    filenameCombine: 'audiencia/audiencia-combine',
    filenamePassed: 'audiencia/audiencia-passed',
    filenameFailed: 'audiencia/audiencia-failed',
    filenameBlank: 'audiencia/audiencia-blank',
});


(async ()=> {

    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);
    let page = await context.newPage();
     
    dbAudienciaQuick.executarBackup();
    process.on('SIGINT', () => dbAudienciaQuick.salvarAlteracoes('SIGINT', allTested));
    process.on('SIGTERM', () => dbAudienciaQuick.salvarAlteracoes('SIGTERM', allTested));

    const listaBusca = dbAudienciaQuick.numerosAtendimentos;

    await page.goto("https://proconsumidor.mj.gov.br/#/inicio", { waitUntil: "networkidle", timeout: customTimeout.general });
    let allTested: any[] = [];

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

           
             
            dbAudienciaQuick.carregarAlteracoes(allTested);
            allTested.length = 0;
            
        } catch (error) {

            const argsFailed = Array(11).fill('') as TuplaInformacoesFailedAudiencia;
            const audienciaFailed = new TratativaAudiencia('failed', numeroAtendimento.Formatacao(1), ...argsFailed,);
            const estruturaFailed = audienciaFailed.retornaEstrutura(0);
            allTested.push(estruturaFailed);
            logger.log('failed', `${numeroAtendimento.Formatacao(1)} ⚖️ ❌`);

        }
    }

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();
    
})();




























































































































































































