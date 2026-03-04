import playwright from 'playwright';
import { customContext } from './config/contex.config';
import { createLogger } from './config/loggers.config';
import { Consumidor, NumeroAtendimento, TuplaInformacoesFailedConsumidor, TuplaInformacoesParciaisConsumidor } from './lib/definitions';
import { coordenadasCep } from './test';

let allTested = [];
let cont = 0;
const regexTipoAtendimento = new RegExp(`(denuncia|reclamacao|consulta)`, 'i');
const regexWaitForResponseLastUrlRequest = new RegExp('cep\/consultar(\/[a-zA-Z0-9-._]+)*\/?$');
const regexTextPainelExtensivel = new RegExp('^Dados da (Reclamação|Consulta|Denúncia)$');

const logger = createLogger({
    filenameCombine: 'bairros/bairros-combine',
    filenamePassed: 'bairros/bairros-passed',
    filenameFailed: 'bairros/bairros-failed'
});

(async () => {

    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch();
    const context = await customContext(browser)
    const page = await context.newPage();

    const listaBusca = ['22.12.0532.001.00015-3']

    for (const NA of listaBusca) {

        try {

            if (cont % 1000 == 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: 60000 });

            const numeroAtendimento = new NumeroAtendimento(NA);

            try {

                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').click();
                await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: 60000 });
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

                const dropdownMenu = painelExpansivel().getByRole('button').first();
                await dropdownMenu.click();
                const botaoDetalhar = page.getByText('Detalhar');
                await botaoDetalhar.click();
                await page.waitForResponse(regexWaitForResponseLastUrlRequest);
                const informacoesParciaisConsumidor = await Promise.all((await page.locator('.modal-body label + input').all()).map(async informacao => await informacao.inputValue()));
                const args = informacoesParciaisConsumidor as TuplaInformacoesParciaisConsumidor;
                const telefones: string[] = await page.locator('app-telefone table tbody tr:nth-child(n) > td').allInnerTexts();
                const telefone: string = telefones.join(' - ');
                const cep = informacoesParciaisConsumidor[6];
                const [latitude, longitude] = await coordenadasCep(cep);
                const consumidor = new Consumidor('passed', latitude, longitude, numeroAtendimento.Formatacao(1), ...args, telefone);
                const estruturaConsumidor = consumidor.retornaEstrutura(1);
                allTested.push(estruturaConsumidor);
                logger.log('passed', `${numeroAtendimento.Formatacao(1)} 👤 ✅`);
            }

            catch (error) {
                const argsFailed = Array(15).fill('') as TuplaInformacoesFailedConsumidor;
                const consumidorFailed = new Consumidor('failed', '', '', ...argsFailed);
                const estruturaConsumidorFailed = consumidorFailed.retornaEstrutura(1);
                //allTested.push(estruturaConsumidorFailed);
                //logger.log('failed', `${numeroAtendimento.Formatacao(1)} 👤 ❌`);
                continue;
            }

            if (cont % 100 == 0 && cont > 0) {
                //logger.info(`${cont} alterações carregadas com sucesso 👌`);
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
