import playwright from 'playwright';
import { createLogger } from './config/loggers.config';
import { coordenadasCep } from './config/fetchApi.config';
import { TuplaInfomacoesNulasConsumidor, TuplaInformacoesFailedConsumidor, TuplaInformacoesParciaisConsumidorPessoaJuridica, TuplaInformacoesParciaisConsumidorPessoaFisica } from './types/index';
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout } from './config/customDefinitions.config';
import { carregarAlteracoesBaseConsumidorBairrosSuperendividamento, numerosAtendimentosBairrosSuperendividamento } from './utils/databaseConsumidor.quickAcessFunctions';
import { ConsumidorPessoaFisica, ConsumidorPessoaJuridica, NumeroAtendimento } from './lib/definitions';

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

    const itensBusca = numerosAtendimentosBairrosSuperendividamento;

    for (const NA of itensBusca) {

        await customOptimizationPageRoute(page);
        page = contadorOcorrencia % limiteComparativo === 0 ? await customRefreshPage(context, page) : page;

        try {

            if (contadorOcorrencia % limiteComparativo === 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: customTimeout.general });

            const numeroAtendimento = new NumeroAtendimento(NA);
            const regexUrlTiposAtendimento = new RegExp(`https:\/\/proconsumidor.mj.gov.br\/#\/(denuncia|consulta|reclamacao)\/pesquisa\/${numeroAtendimento.Formatacao(2)}`)

            try {

                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').first().click({ timeout: customTimeout.click });
                await page.waitForURL(regexUrlTiposAtendimento, { timeout: customTimeout.general });
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
                    await page.locator('div').filter({ hasText: regexTextPainelExtensivel }).nth(1).click({ timeout: customTimeout.click });
                }

                if (await painelExpansivel().getByLabel('Origem do Atendimento').locator('option:checked').isVisible() && await painelExpansivel().getByLabel('Origem do Atendimento').locator('option:checked').textContent()  == 'Ofício ') {
                    logger.log('blank', `${numeroAtendimento.Formatacao(1)} 📄 🖋️`);
                    allTested.push({ NumeroAtendimento: numeroAtendimento.Formatacao(1), Bairro: 'Reclamacao de Oficio' });
                }

                else {
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
                            await page.waitForResponse(regexWaitForResponseLastUrlRequest, { timeout: customTimeout.general });
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
                        await page.getByRole('button', { name: 'Close' }).first().click({ timeout: customTimeout.general });
                        logger.log('passed', `${numeroAtendimento.Formatacao(1)} ${emojiNaturezaConsumidor}`);

                    }
                }
            }

            catch (error) {
                const argsFailed = Array(16).fill('') as TuplaInformacoesFailedConsumidor;
                const consumidorFailed = new ConsumidorPessoaFisica('failed', numeroAtendimento.Formatacao(1), '', ...argsFailed);
                const estruturaConsumidorFailed = consumidorFailed.retornaEstrutura(1);
                allTested.push(estruturaConsumidorFailed);
                logger.log('failed', `${numeroAtendimento.Formatacao(1)} 👤 ❌`);
                logger.error(error)
                continue;
            }

            carregarAlteracoesBaseConsumidorBairrosSuperendividamento(allTested);
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
