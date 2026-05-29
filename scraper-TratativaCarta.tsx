import playwright from 'playwright';
import { TuplaInformacoesFailedCarta, TuplaInformacoesNulasCarta, TuplaInformacoesParciaisCarta } from './types/index';
import { NumeroAtendimento, TratativaCarta } from './lib/definitions';
import { carregarAlteracoes, executarBackup, salvarAlteracoes, numerosAtendimentos } from './utils/databaseCartas.quickAccessFunctions';
import { createLogger } from './config/loggers.config';
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage } from './config/customDefinitions.config';

const logger = createLogger({
    filenameCombine: 'cartas/cartas-combine',
    filenamePassed: 'cartas/cartas-passed',
    filenameFailed: 'cartas/cartas-failed',
    filenameBlank: 'cartas/cartas-blank',
});

const textoBusca = 'Carta';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');

let allTested: any[] = [];
let contadorOcorrencia = 0;
let limiteComparativo = 100;

(async () => {

    console.time("Tempo-de-Execução-Total");

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);
    let page = await context.newPage();

    const listaBusca = numerosAtendimentos;

    executarBackup();

    process.on('SIGINT', () => salvarAlteracoes('SIGINT', allTested));
    process.on('SIGTERM', () => salvarAlteracoes('SIGTERM', allTested));

    for (const NA of listaBusca) {

        page = contadorOcorrencia % limiteComparativo === 0 ? await customRefreshPage(context, page) : page;
        await customOptimizationPageRoute(page);

        try {

            if (contadorOcorrencia % limiteComparativo === 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: 90000 });

            const numeroAtendimento = new NumeroAtendimento(NA);

            try {

                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').click({ timeout: 90000 });
                await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: 90000 });
                await page.waitForSelector('.loader-container', { state: 'hidden' });

                const painelTratativa = page.locator('app-tratativa');

                if (!await painelTratativa.isVisible()) {

                    await page.getByTitle('Clique para Expandir/Recolher').filter({ hasText: "Tratativas" }).click();

                }

                const conjuntoCorrespondencia = await page.getByText(regexBusca).all();

                if (conjuntoCorrespondencia.length === 0) {

                    const argsBlank = Array(6).fill('') as TuplaInformacoesNulasCarta;
                    const cartaBlank = new TratativaCarta('blank', numeroAtendimento.Formatacao(1), 'Ausência de Tratativa', ...argsBlank);
                    const estruturaBlank = cartaBlank.retornaEstrutura(1);
                    allTested.push(estruturaBlank);
                    logger.log('blank', `${numeroAtendimento.Formatacao(1)} ✉️ 🔗`);

                } else {

                    for (const correspondencia of conjuntoCorrespondencia) {

                        await correspondencia.click({ timeout: 90000 });
                        await page.waitForSelector('.loader-container', { state: 'hidden' });
                        const situacaoCarta = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';

                        const tabelaCarta = await page.locator('app-tratativa table tbody tr:nth-child(n)').all();
                        for (const linha of tabelaCarta) {

                            const conteudoLinha: string[] = await linha.locator('> td').allInnerTexts();
                            const args = conteudoLinha as TuplaInformacoesParciaisCarta;
                            const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                            const fornecedorCodigo = (await fornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                            const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
                            const carta = new TratativaCarta('passed', numeroAtendimento.Formatacao(1), situacaoCarta, fornecedorCodigo, fornecedorCNPJ, ...args);
                            const estrutura = carta.retornaEstrutura(1);
                            allTested.push(estrutura);
                            logger.log('passed', `${numeroAtendimento.Formatacao(1)} ✉️ ✅`);

                        }
                    }
                }

            } catch (error) {

                const argsFailed = Array(7).fill('') as TuplaInformacoesFailedCarta;
                const cartaFailed = new TratativaCarta('failed', numeroAtendimento.Formatacao(1), ...argsFailed,);
                const estruturaFailed = cartaFailed.retornaEstrutura(1);
                allTested.push(estruturaFailed);
                logger.log('failed', `${numeroAtendimento.Formatacao(1)} ✉️ ❌`);
                continue;
            }

            carregarAlteracoes(allTested);
            allTested.length = 0;
            if (contadorOcorrencia % limiteComparativo === 0) logger.info(`${contadorOcorrencia}/${listaBusca.length} alterações carregadas com sucesso 👌`);
            contadorOcorrencia++;

        } catch (error) {
            logger.error(error);
            break;
        }
    }

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();