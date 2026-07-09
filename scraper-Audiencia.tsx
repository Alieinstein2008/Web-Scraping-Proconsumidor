import playwright from 'playwright';
import { NumeroAtendimento, TratativaAudiencia } from "./lib/definitions";
import { TuplaInformacoesFailedAudiencia, TuplaInformacoesNulasAudiencia, TuplaInformacoesParciaisAudienciaCancelada, TuplaInformacoesParciaisAudienciaFinalizada } from "./types/audiencia.types";
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, TIMEOUTS } from "./config/customDefinitions.config";
import { createLogger } from './config/loggers.config';
import { carregarAlteracoes, salvarAlteracoes, executarBackup, numerosAtendimentos } from './utils/databaseAudiencia.quickAcessFunctions';

const logger = createLogger({
    filenameCombine: 'audiencia/audiencia-combine',
    filenamePassed: 'audiencia/audiencia-passed',
    filenameFailed: 'audiencia/audiencia-failed',
    filenameBlank: 'audiencia/audiencia-blank',
});

const textoBusca = 'Audiência';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
const regexDataAudiencia = new RegExp(` Dia \\d{2} de [A-Za-z]+ de \\d{4}`, 'i');
const regexDataAbertura = new RegExp('\\d{2}\\/\\d{2}\\/\\d{4}', 'i');

(async () => {

    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);
    let page = await context.newPage();

    const textoBusca = 'Audiência';
    const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
    const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
    const regexDataAudiencia = new RegExp(` Dia \\d{2} de [A-Za-z]+ de \\d{4}`, 'i');
    const regexDataAbertura = new RegExp('\\d{2}\\/\\d{2}\\/\\d{4}', 'i');

    const listaBusca = numerosAtendimentos;

    await page.goto("https://proconsumidor.mj.gov.br/#/inicio", { waitUntil: "networkidle", timeout: TIMEOUTS.NAVIGATION });
    let allTested: any[] = [];

    executarBackup();
    process.on('SIGINT', () => salvarAlteracoes('SIGINT', allTested));
    process.on('SIGTERM', () => salvarAlteracoes('SIGTERM', allTested));

    for (const NA of listaBusca) {

        const numeroAtendimento = new NumeroAtendimento(NA);

        try {

            await page.getByPlaceholder("Nº de Atendimento").fill(numeroAtendimento.formatacao('Completa'));
            await page.getByTitle("Pesquisar").first().click({ timeout: 30000 });
            await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.formatacao('Apenas Números')}`, { timeout: TIMEOUTS.NAVIGATION });
            await page.waitForSelector(".loader-container", { state: "hidden" });

            const painelTratativa = page.locator('app-tratativa');

            if (!await painelTratativa.isVisible()) {
                await page.getByTitle('Clique para Expandir/Recolher').filter({ hasText: "Tratativas" }).click();
            };

            const conjuntoCorrespondencia = await page.getByText(regexBusca).all();

            if (conjuntoCorrespondencia.length === 0) {

                const argsBlank = Array(10).fill('') as TuplaInformacoesNulasAudiencia;
                const audienciaBlank = new TratativaAudiencia('blank', numeroAtendimento.formatacao('Completa'), 'Ausência de Tratativa', ...argsBlank);
                const estruturaBlank = audienciaBlank.retornaEstrutura(1);
                allTested.push(estruturaBlank);
                logger.log('blank', `${numeroAtendimento.formatacao('Completa')} ⚖️ ⚠️`);

            } else {
                for (const correspondencia of conjuntoCorrespondencia) {

                    await correspondencia.click({ timeout: 90000 });
                    await page.waitForSelector('.loader-container', { state: 'hidden' });

                    const situacaoAudiencia = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';

                    const tabelaAudiencia = await page.locator('app-tratativa table tbody tr:nth-child(n)').all();

                    for (const linha of tabelaAudiencia) {

                        if (situacaoAudiencia.trim() === 'Finalizada') {
                            const dataAbertura = (await page.locator('app-reclamacao-cadastro div.col-md-12 div.card-body .row .col-md-3 span').first().textContent() ?? '').match(regexDataAbertura)?.[0] ?? '';
                            const dataAudiencia = (await page.locator('app-tratativa-audiencia').first().filter({ hasText: regexDataAudiencia }).textContent() ?? '').match(regexDataAudiencia)?.[0] ?? '';
                            const conteudoLinha: string[] = (await linha.locator('> td').allInnerTexts()).slice(0, 4);
                            const args = conteudoLinha as TuplaInformacoesParciaisAudienciaFinalizada;
                            const painelFornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                            const fornecedorCodigo = (await painelFornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                            const fornecedorCNPJ = await painelFornecedor.locator('input').nth(3).inputValue();
                            const resultadoAudiencia = (await page.locator('app-visualizar-audiencia #resultadoAudiencia option:checked').textContent()) ?? '';

                            const audiencia = new TratativaAudiencia('passed', numeroAtendimento.formatacao('Completa'), fornecedorCodigo, dataAbertura, args[0], fornecedorCNPJ, dataAudiencia, situacaoAudiencia, '', resultadoAudiencia, '', '', '');
                            const estrutura = audiencia.retornaEstrutura(0);

                            allTested.push(estrutura);
                            logger.log('passed', `${numeroAtendimento.formatacao('Completa')} ⚖️ ✅`);

                        }

                        if (situacaoAudiencia.trim() === 'Cancelada') {
                            const dataAudiencia = (await page.locator('app-tratativa-audiencia').first().filter({ hasText: regexDataAudiencia }).textContent() ?? '').match(regexDataAudiencia)?.[0] ?? '';
                            const conteudoLinha: string[] = (await linha.locator('> td').allInnerTexts()).slice(0, 1);
                            const args = conteudoLinha as TuplaInformacoesParciaisAudienciaCancelada;
                            const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                            const fornecedorCodigo = (await fornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                            const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
                            const scraping = 'passed';
                            const dataAbertura = (await page.locator('app-reclamacao-cadastro div.col-md-12 div.card-body .row .col-md-3 span').first().textContent() ?? '').match(regexDataAbertura)?.[0] ?? '';
                            const audiencia = new TratativaAudiencia('passed', numeroAtendimento.formatacao('Completa'), fornecedorCodigo, dataAbertura, args[0], fornecedorCNPJ, dataAudiencia, situacaoAudiencia, '', '', '', '', '');
                            const estrutura = audiencia.retornaEstrutura(0);

                            allTested.push(estrutura);
                            logger.log('passed', `${numeroAtendimento.formatacao('Completa')} ⚖️ ✅`);

                        }
                    }
                }
            }

            carregarAlteracoes(allTested);
            allTested.length = 0;
            
        } catch (error) {

            const argsFailed = Array(11).fill('') as TuplaInformacoesFailedAudiencia;
            const audienciaFailed = new TratativaAudiencia('failed', numeroAtendimento.formatacao('Completa'), ...argsFailed,);
            const estruturaFailed = audienciaFailed.retornaEstrutura(0);
            allTested.push(estruturaFailed);
            logger.log('failed', `${numeroAtendimento.formatacao('Completa')} ⚖️ ❌`);

        }
    }

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();




