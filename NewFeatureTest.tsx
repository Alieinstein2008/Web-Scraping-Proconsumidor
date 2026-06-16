import playwright from 'playwright';

import { createLogger } from './config/loggers.config';
import { coordenadasCep } from './config/fetchApi.config';
import { TuplaInfomacoesNulasConsumidor, TuplaInformacoesFailedConsumidor, TuplaInformacoesParciaisConsumidorPessoaJuridica, TuplaInformacoesParciaisConsumidorPessoaFisica } from './types/index';
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, TIMEOUTS } from './config/customDefinitions.config';
//import { carregarAlteracoes, executarBackup, numerosAtendimentos, salvarAlteracoes } from './utils/databaseConsumidor.quickAcessFunctions';
import { ConsumidorPessoaFisica, ConsumidorPessoaJuridica, NumeroAtendimento } from './lib/definitions';

const numerosAtendimentos = [
    '23.12.0532.006.00116-2', '26.04.0532.006.00080-3', '26.04.0532.006.00018-3', '26.04.0532.006.00022-3', '25.10.0532.006.00019-100',
    '26.04.0532.006.00024-3', '26.04.0532.006.00026-3', '26.04.0532.006.00025-3',
    '26.04.0532.006.00069-3', '26.04.0532.006.00067-3', '26.04.0532.006.00068-3',
    '26.04.0532.006.00066-3', '26.04.0532.006.00063-3', '26.04.0532.006.00041-3',
    '26.04.0532.006.00007-3', '26.04.0532.006.00056-3', '26.04.0532.006.00029-3',
    '26.04.0532.006.00051-3', '26.04.0532.006.00053-3', '26.04.0532.006.00077-3',
    '26.04.0532.006.00003-3', '26.04.0532.006.00040-3', '26.04.0532.006.00019-3',
    '26.04.0532.006.00014-3', '26.04.0532.006.00031-3', '26.04.0532.006.00062-3',
    '26.04.0532.006.00001-3', '26.04.0532.006.00076-3', '26.04.0532.006.00012-3',
    '26.04.0532.006.00020-3', '26.04.0532.006.00064-3', '26.04.0532.006.00030-3',
    '26.04.0532.006.00037-3', '26.04.0532.006.00052-3', '26.04.0532.006.00039-3',
    '26.04.0532.006.00078-3', '26.04.0532.006.00070-3', '26.04.0532.006.00059-3',
    '26.04.0532.006.00048-3', '26.04.0532.006.00011-3', '26.04.0532.006.00038-3',
    '26.04.0532.006.00002-3', '26.04.0532.006.00004-3', '26.04.0532.006.00005-3',
    '26.04.0532.006.00006-3', '26.04.0532.006.00047-3', '26.04.0532.006.00054-3',
    '26.04.0532.006.00013-3', '26.04.0532.006.00034-3', '26.04.0532.006.00008-3',
    '26.04.0532.006.00015-3', '26.04.0532.006.00050-3', '26.04.0532.006.00055-3',
    '26.04.0532.006.00058-3', '26.04.0532.006.00057-3', '26.04.0532.006.00009-3',
    '26.04.0532.006.00023-3', '26.04.0532.006.00035-3', '26.04.0532.006.00036-3',
    '26.04.0532.006.00049-3', '26.04.0532.006.00032-3', '26.04.0532.006.00021-3',
    '26.04.0532.006.00010-3', '26.04.0532.006.00074-3', '26.04.0532.006.00033-3',
    '26.04.0532.006.00045-3', '26.04.0532.006.00044-3', '26.04.0532.006.00079-1',
    '26.04.0532.006.00061-1', '26.04.0532.006.00027-1', '26.04.0532.006.00017-1',
    '26.04.0532.006.00060-1', '26.04.0532.006.00043-1', '26.04.0532.006.00075-1'
];

let allTested: any[] = [];
const numeroPaginasParalelas = 10;

const regexWaitForResponseLastUrlRequest = new RegExp('cep\/consultar(\/[a-zA-Z0-9-._]+)*\/?$');
const regexTextPainelExtensivel = new RegExp('^Dados da (Reclamação|Consulta|Denúncia)$', 'gm');

const logger = createLogger({
    filenameCombine: 'consumidor/consumidor-combine',
    filenamePassed: 'consumidor/consumidor-passed',
    filenameFailed: 'consumidor/consumidor-failed',
    filenameBlank: 'consumidor/consumidor-blank'
});

function dividirArray<T>(array: T[], numeroPartes: number): T[][] {
    const matrizResultante: T[][] = Array.from({ length: numeroPartes }, () => []);
    array.forEach((elemento, indice) => {
        matrizResultante[indice % numeroPartes].push(elemento);
    });
    return matrizResultante;
};

async function processaLote(page: playwright.Page, lote: string[]) {
    const resultadosLote = [];
    for (let index = 0; index < lote.length; index++) {
        const resultado = await buscaAlvo(page, lote[index], index === 0);
        resultadosLote.push(resultado);
        console.log(resultado)
    }
    return resultadosLote;
}


async function buscaAlvo(page: playwright.Page, numeroAtendimento: string, primeiroAlvo: boolean) {

    const instanciaNumeroAtendimento = new NumeroAtendimento(numeroAtendimento);

    try {

        if (primeiroAlvo) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle', timeout: TIMEOUTS.NAVIGATION });

        await page.getByPlaceholder('Nº de Atendimento').fill(instanciaNumeroAtendimento.formatacao('Completa'));
        await page.getByTitle('Pesquisar').click({ timeout: TIMEOUTS.CLICK });

        const painelConsumidor = page.locator(`app-${instanciaNumeroAtendimento.obterTipo('texto')}-consumidor`);

        if (await painelConsumidor.isHidden()) {
            await page.locator('button.accordion-heading')
                .filter({ hasText: regexTextPainelExtensivel })
                .click({ timeout: TIMEOUTS.CLICK });
            await page.waitForSelector('.loader-container', { state: 'hidden' });
        }

        if (
            await page.locator('select[name="origem"]').isVisible() &&
            await page.$eval('select[name="origem"]', (el: HTMLSelectElement) => el.options[el.selectedIndex].text.trim()) === 'Ofício'
        ) {
            return {
                numeroAtendimento: instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'),
                tipo: 'Reclamacao de oficio'
            }
        } else {

            const tipoIdentidadeConsumidor: 'Anônimo' | string = await painelConsumidor.locator('input#nome_consumidor').inputValue();

            if (tipoIdentidadeConsumidor === 'Anônimo') {
                return {
                    numeroAtendimento: instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'),
                    tipo: 'Anonimo'
                }

            } else {

                await painelConsumidor
                    .getByRole('button', { expanded: false })
                    .first()
                    .click();

                const linkDetalhar = page.locator('.dropdown-menu.show a.dropdown-item', { hasText: /^Detalhar\s*$/ });
                linkDetalhar.click({ timeout: TIMEOUTS.CLICK });

                await page.waitForResponse(regexWaitForResponseLastUrlRequest);
                await page.waitForSelector('.loader-container', { state: 'hidden' });


                let naturezaConsumidor: 'Fisica' | 'Juridica' = 'Fisica';
                let emojiNaturezaConsumidor: '👤 ✅' | '🏢 ✅' = '👤 ✅';


                if (await page.locator('app-detalhe-consumidor .modal-body label', { hasText: 'CNPJ' }).isVisible()) {
                    naturezaConsumidor = 'Juridica';
                    emojiNaturezaConsumidor = '🏢 ✅';
                    await page.waitForResponse(regexWaitForResponseLastUrlRequest, { timeout: TIMEOUTS.ELEMENT });
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
                const consumidor = args.length === 12 ? new ConsumidorPessoaFisica('passed', instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'), ...args, telefone, latitude, longitude) : new ConsumidorPessoaJuridica('passed', instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'), ...args, telefone, latitude, longitude);
                const estruturaConsumidor = consumidor.retornaEstrutura(1);

                const modalHeader = page.locator('.modal-header').filter({ hasText: 'Detalhe do Consumidor' });

                await modalHeader.getByRole('button', { name: 'Close' }).click();

                await modalHeader.waitFor({ state: 'hidden' });

                await page.screenshot({ path: 'scren.jpg' });

                return {
                    numeroAtendimento: instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'),
                    tipo: args,
                }
            }
        }


    } catch (error) {
        console.log(error)
        return {
            tipo: 'failed',
            numeroAtendimento: instanciaNumeroAtendimento.formatacao('Números, simbolos e dígito indicador'),
        }
    }


}
(async () => {

    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);

    const pages = await Promise.all(Array.from({ length: numeroPaginasParalelas }, () => context.newPage()));
    await Promise.all(pages.map(page => customOptimizationPageRoute(page)));

    const itensBusca = numerosAtendimentos;
    const gruposBusca = dividirArray(itensBusca, numeroPaginasParalelas);

    const resultados = await Promise.all(
        pages.map((page, index) => processaLote(page, gruposBusca[index]))
    );

    await Promise.all(pages.map(page => page.close()));
    await browser.close();

    console.timeEnd("Tempo-de-Execução-Total");

})();
