import playwright from 'playwright';
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage } from './config/customDefinitions.config';
import { createLogger } from './config/loggers.config';
import { ConsumidorPessoaFisica, ConsumidorPessoaJuridica, NumeroAtendimento, TuplaInfomacoesNulasConsumidor, TuplaInformacoesFailedConsumidor, TuplaInformacoesParciaisConsumidorPessoaJuridica, TuplaInformacoesParciaisConsumidorPessoaFisica } from './lib/definitions';
import { coordenadasCep } from './config/fetchApi.config';
import { carregarAlteracoesBaseConsumidorBairrosRegionais, numerosAtendimentosBairrosRegionais } from './utils/databaseConsumidor.quickAcessFunctions';

let allTested = [];
let limiteComparativo = 100;
let contadorOcorrencia = 0;
const regexWaitForResponseLastUrlRequest = new RegExp('cep\/consultar(\/[a-zA-Z0-9-._]+)*\/?$');
const regexTextPainelExtensivel = new RegExp('^Dados da (Reclamação|Consulta|Denúncia)$');

const logger = createLogger({
    filenameCombine: 'consumidor/consumidor-combine',
    filenamePassed: 'consumidor/consumidor-passed',
    filenameFailed: 'consumidor/consumidor-failed',
    filenameBlank: 'consumidor/consumidor-blank'
});

(async () => {

    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });

    const context = await customContext(browser);

    let page = await context.newPage();

    const itensBusca = numerosAtendimentosBairrosRegionais;

    for (const NA of itensBusca) {

        page = contadorOcorrencia % limiteComparativo === 0 ? await customRefreshPage(context, page) : page;
        await customOptimizationPageRoute(page);

        try {

            if (contadorOcorrencia % limiteComparativo === 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: 90000 });

            const numeroAtendimento = new NumeroAtendimento(NA);
            const regexUrlTiposAtendimento = new RegExp(`https:\/\/proconsumidor.mj.gov.br\/#\/(denuncia|consulta|reclamacao)\/pesquisa\/${numeroAtendimento.Formatacao(2)}`)

            try {

                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').first().click({ timeout: 30000 });
                await page.waitForURL(regexUrlTiposAtendimento, { timeout: 60000 });
                await page.waitForSelector('.loader-container', { state: 'hidden' });

                const painelExpansivel = () => {
                    switch (numeroAtendimento.Formatacao(1).slice(21, 22)) {
                        case '1':
                            return page.locator('app-dados-consulta');
                        case '2':
                            return page.locator('app-dados-denuncia');
                        case '3':
                            return page.locator('app-dados-reclamacao');
                        default:
                            return page.locator('div');
                    }
                };

                if (!await painelExpansivel().isVisible()) {
                    await page.locator('div').filter({ hasText: regexTextPainelExtensivel }).nth(1).click({ timeout: 30000 });
                }

                await painelExpansivel().locator('div.sub-titulo', { hasText: 'Consumidor' }).waitFor({ state: 'visible' })
                const dropdownMenu = painelExpansivel().getByRole('button').first();

                const tipoIdentidadeConsumidor: 'Anônimo' | string = await painelExpansivel().getByRole('textbox', { name: 'Nome do Consumidor' }).inputValue();

                if (tipoIdentidadeConsumidor === 'Anônimo') {
                    const argsBlank = Array(14).fill('') as TuplaInfomacoesNulasConsumidor;
                    const consumidorBlank = new ConsumidorPessoaFisica('blank', numeroAtendimento.Formatacao(1), 'Anônimo', ...argsBlank);
                    const estruturaConsumidorBlank = consumidorBlank.retornaEstrutura(1);
                    allTested.push(estruturaConsumidorBlank);
                    logger.log('blank', `${numeroAtendimento.Formatacao(1)} 👤 ❔`);

                } else {

                    await dropdownMenu.click();
                    const botaoDetalhar = page.getByText('Detalhar').first();
                    await botaoDetalhar.click();
                    await page.waitForResponse(regexWaitForResponseLastUrlRequest);
                    await page.waitForSelector('.loader-container', { state: 'hidden' });

                    let naturezaConsumidor: 'Fisica' | 'Juridica' = 'Fisica';
                    let emojiNaturezaConsumidor: '👤 ✅' | '🏢 ✅' = '👤 ✅';

                    if (await page.locator('app-detalhe-consumidor .modal-body label', { hasText: 'CNPJ' }).isVisible()) {
                        naturezaConsumidor = 'Juridica';
                        emojiNaturezaConsumidor = '🏢 ✅';
                        await page.waitForResponse(regexWaitForResponseLastUrlRequest, { timeout: 60000 });
                        await page.waitForSelector('.loader-container', { state: 'hidden' });
                    };

                    const informacoesParciaisConsumidor = async () => {
                        return await Promise.all((await page.locator('app-detalhe-consumidor .modal-body label + input').all()).map(async informacao => await informacao.inputValue()));
                    };

                    const argsConsumidor = async () => {
                        return naturezaConsumidor === 'Fisica' ? await informacoesParciaisConsumidor() as TuplaInformacoesParciaisConsumidorPessoaFisica : await informacoesParciaisConsumidor() as TuplaInformacoesParciaisConsumidorPessoaJuridica;
                    };

                    const info = await informacoesParciaisConsumidor();
                    const args = await argsConsumidor();

                    const telefones: string[] = await page.locator('app-telefone table tbody tr:nth-child(n) > td').allInnerTexts();
                    const telefone: string = telefones.join(' - ');
                    const cep = naturezaConsumidor === 'Fisica' ? info[6] : info[2];
                    const [latitude, longitude] = await coordenadasCep(cep);
                    const consumidor = args.length === 12 ? new ConsumidorPessoaFisica('passed', numeroAtendimento.Formatacao(1), ...args, telefone, latitude, longitude) : new ConsumidorPessoaJuridica('passed', numeroAtendimento.Formatacao(1), ...args, telefone, latitude, longitude);
                    const estruturaConsumidor = consumidor.retornaEstrutura(1);
                    allTested.push(estruturaConsumidor);
                    await page.getByRole('button', { name: 'Close' }).first().click({ timeout: 3000 });
                    logger.log('passed', `${numeroAtendimento.Formatacao(1)} ${emojiNaturezaConsumidor}`);

                }
            }

            catch (error) {
                const argsFailed = Array(14).fill('') as TuplaInformacoesFailedConsumidor;
                const consumidorFailed = new ConsumidorPessoaFisica('failed', '', '', ...argsFailed);
                const estruturaConsumidorFailed = consumidorFailed.retornaEstrutura(1);
                allTested.push(estruturaConsumidorFailed);
                logger.error(error)
                logger.log('failed', `${numeroAtendimento.Formatacao(1)} 👤 ❌`);
                continue;
            }

            carregarAlteracoesBaseConsumidorBairrosRegionais(allTested);
            allTested.length = 0;
            if (contadorOcorrencia % limiteComparativo === 0) logger.info(`${contadorOcorrencia}/${itensBusca.length} alterações carregadas com sucesso 👌`);
            contadorOcorrencia++;

        } catch (error) {
            logger.error(error);
            break;
        }
    }

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();
