import playwright from 'playwright';
import { customContext } from './config/contex.config';
import { createLogger } from './config/loggers.config';
import { Consumidor, NumeroAtendimento, TuplaInfomacoesNulasConsumidor, TuplaInformacoesFailedConsumidor, TuplaInformacoesParciaisConsumidor } from './lib/definitions';
import { coordenadasCep } from './config/fetchApi.config';
import { carregarAlteracoesBaseConsumidorBairrosRegionais, numerosAtendimentosBairrosRegionais } from './utils/databaseConsumidor.quickAcessFunctions';


let allTested = [];
let cont = 0;
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

    const browser = await playwright.chromium.launch();
    const context = await customContext(browser)
    const page = await context.newPage();

    const itensBusca = numerosAtendimentosBairrosRegionais;

    for (const NA of itensBusca) {

        try {

            if (cont % 1000 == 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: 90000 });

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
                    await page.locator('div').filter({ hasText: regexTextPainelExtensivel }).nth(1).click();
                }
                
                await page.waitForSelector('.loader-container', { state: 'hidden' });
                const dropdownMenu = painelExpansivel().getByRole('button').first();
                await page.waitForSelector('.loader-container', { state: 'hidden' });

                if (!await dropdownMenu.isVisible()) {

                    const argsBlank = Array(14).fill('') as TuplaInfomacoesNulasConsumidor;
                    const consumidorBlank = new Consumidor('blank', numeroAtendimento.Formatacao(1), 'Anônimo', ...argsBlank);
                    const estruturaConsumidorBlank = consumidorBlank.retornaEstrutura(1);
                    allTested.push(estruturaConsumidorBlank);
                    logger.log('blank', `${numeroAtendimento.Formatacao(1)} 👤 ❔`);

                } else {

                    await dropdownMenu.click();
                    const botaoDetalhar = page.getByText('Detalhar').first();
                    await botaoDetalhar.click();
                    await page.waitForResponse(regexWaitForResponseLastUrlRequest);
                    await page.waitForSelector('.loader-container', { state: 'hidden' });                    
                    const informacoesParciaisConsumidor = await Promise.all((await page.locator('app-detalhe-consumidor .modal-body label + input').all()).map(async informacao => await informacao.inputValue()));
                    const args = informacoesParciaisConsumidor as TuplaInformacoesParciaisConsumidor;
                    const telefones: string[] = await page.locator('app-telefone table tbody tr:nth-child(n) > td').allInnerTexts();
                    const telefone: string = telefones.join(' - ');
                    const cep = informacoesParciaisConsumidor[6];
                    const [latitude, longitude] = await coordenadasCep(cep);
                    const consumidor = new Consumidor('passed', numeroAtendimento.Formatacao(1), ...args, telefone, latitude, longitude);
                    const estruturaConsumidor = consumidor.retornaEstrutura(1);
                    allTested.push(estruturaConsumidor);
                    logger.log('passed', `${numeroAtendimento.Formatacao(1)} 👤 ✅`);
                    await page.getByRole('button', { name: 'Close' }).click({ timeout: 3000 });
                    
                }
            }

            catch (error) {

                const argsFailed = Array(15).fill('') as TuplaInformacoesFailedConsumidor;
                const consumidorFailed = new Consumidor('failed', '', '', ...argsFailed);
                const estruturaConsumidorFailed = consumidorFailed.retornaEstrutura(1);
                allTested.push(estruturaConsumidorFailed);
                logger.log('failed', `${numeroAtendimento.Formatacao(1)} 👤 ❌`);
                continue;
            }

            if (cont % 100 === 0 && cont > 0) {
                carregarAlteracoesBaseConsumidorBairrosRegionais(allTested);
                logger.info(`${cont} alterações carregadas com sucesso 👌`);

            }

            cont++;

        } catch (error) {
            logger.error(error);
            break;
        }
    }

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();
